import { AppDataSource } from "../config/client";
import { RefreshToken } from "../entities/refreshToken.entity";
import { User } from "../entities/users.entity";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/passwordHasher";

export class AuthService {
  private usersRepo = AppDataSource.getRepository(User);
  private refreshTokenRepo = AppDataSource.getRepository(RefreshToken);

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
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
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

  async refresh(refreshToken: string) {
    const stored = await this.refreshTokenRepo.findOne({
      where: { token: refreshToken },
      relations: ["user"],
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new Error("INVALID_REFRESH");
    }

    const accessToken = signAccessToken(stored.user.id, stored.user.role);

    return { accessToken };
  }

  async logout(refreshToken: string) {
    await this.refreshTokenRepo.delete({ token: refreshToken });
  }
}