import crypto from "crypto";
import { AppDataSource } from "../config/client";
import { RefreshToken } from "../entities/refreshToken.entity";
import { PasswordResetToken } from "../entities/passwordResetToken.entity";
import { User } from "../entities/users.entity";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/passwordHasher";
import { sendPasswordResetEmail } from "../utils/mailer";
import logger from "../utils/logger";

const REFRESH_TOKEN_TTL_MS = 15 * 24 * 60 * 60 * 1000; // 15 days

export class AuthService {
  private usersRepo = AppDataSource.getRepository(User);
  private refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
  private resetRepo = AppDataSource.getRepository(PasswordResetToken);

  async register(email: string, password: string, name?: string) {
    const existing = await this.usersRepo.findOne({ where: { email } });

    if (existing) {
      throw new Error("EMAIL_EXISTS");
    }

    const passwordHash = await hashPassword(password);

    const user = this.usersRepo.create({ email, passwordHash, name });

    return await this.usersRepo.save(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });

    if (!user || !user.isActive) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);

    const refreshTokenEntity = this.refreshTokenRepo.create({
      token: refreshToken,
      user: user,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    await this.refreshTokenRepo.save(refreshTokenEntity);

    await this.usersRepo.update(user.id, { lastLoginAt: new Date() });

    const userDetails = {
      name: user.name,
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return { accessToken, userDetails, refreshToken };
  }

  /**
   * Validate a refresh token (signature + DB record + expiry + active user),
   * then rotate it: the old token is deleted and a fresh access/refresh pair
   * is issued. This prevents indefinite reuse of a single refresh token.
   */
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new Error("INVALID_REFRESH");
    }

    // 1. Verify the JWT signature/expiry before touching the DB.
    try {
      verifyRefreshToken(refreshToken);
    } catch {
      throw new Error("INVALID_REFRESH");
    }

    // 2. Ensure the token still exists server-side (not revoked/logged out).
    const stored = await this.refreshTokenRepo.findOne({
      where: { token: refreshToken },
      relations: ["user"],
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new Error("INVALID_REFRESH");
    }

    if (!stored.user || !stored.user.isActive) {
      throw new Error("INVALID_REFRESH");
    }

    // 3. Rotate: remove the old token and issue a new pair.
    await this.refreshTokenRepo.delete({ id: stored.id });

    const accessToken = signAccessToken(stored.user.id, stored.user.role);
    const newRefreshToken = signRefreshToken(stored.user.id);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        token: newRefreshToken,
        user: stored.user,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      })
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    await this.refreshTokenRepo.delete({ token: refreshToken });
  }

  /**
   * Begin a password reset. Always resolves successfully (even for unknown
   * emails) so the endpoint can't be used to enumerate accounts.
   */
  async forgotPassword(email: string) {
    const user = await this.usersRepo.findOne({ where: { email } });

    if (!user || !user.isActive) {
      logger.info(`[Auth] Password reset requested for unknown email: ${email}`);
      return;
    }

    // Invalidate any previously-issued, still-unused reset tokens.
    await this.resetRepo
      .createQueryBuilder()
      .update()
      .set({ used: true })
      .where('"userId" = :id AND used = false', { id: user.id })
      .execute();

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresMin = Number(process.env.PASSWORD_RESET_EXPIRES_MIN || 60);

    await this.resetRepo.save(
      this.resetRepo.create({
        tokenHash,
        user,
        expiresAt: new Date(Date.now() + expiresMin * 60 * 1000),
      })
    );

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:4200";
    const resetLink = `${baseUrl}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(user.email, resetLink);
  }

  /**
   * Check whether a raw reset token (from the email link) is currently usable:
   * it must exist, be unused, and not be expired. Read-only — used by the reset
   * page to validate the link on load. Returns a boolean (no user info leaked).
   */
  async validateResetToken(rawToken: string): Promise<boolean> {
    if (!rawToken) return false;

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const record = await this.resetRepo.findOne({ where: { tokenHash } });

    return !!record && !record.used && record.expiresAt > new Date();
  }

  /**
   * Complete a password reset using the raw token from the email link.
   * On success the password is changed and ALL refresh tokens for that user
   * are revoked, forcing a fresh login everywhere.
   */
  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const record = await this.resetRepo.findOne({
      where: { tokenHash },
      relations: ["user"],
    });

    if (!record || record.used || record.expiresAt < new Date()) {
      throw new Error("INVALID_RESET_TOKEN");
    }

    const passwordHash = await hashPassword(newPassword);
    await this.usersRepo.update(record.user.id, { passwordHash });

    record.used = true;
    await this.resetRepo.save(record);

    // Revoke every refresh token for this user — force re-login everywhere.
    await this.refreshTokenRepo
      .createQueryBuilder()
      .delete()
      .where('"userId" = :id', { id: record.user.id })
      .execute();
  }
}
