import nodemailer, { Transporter } from "nodemailer";
import logger from "./logger";

/**
 * Lazily-created SMTP transporter. If SMTP is not configured we fall back to
 * logging the email contents so the flow still works in local development.
 */
let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST) {
    return null;
  }

  // Host configured but credentials missing (e.g. Gmail App Password not yet
  // filled in): don't attempt to send — fall back to logging the link so the
  // reset flow keeps working instead of failing with an auth error.
  if (!SMTP_USER || !SMTP_PASS) {
    logger.warn(
      "[Mailer] SMTP_HOST is set but SMTP_USER/SMTP_PASS are empty — reset links will be logged, not emailed. Add your Gmail address + App Password to .env."
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth:
      SMTP_USER && SMTP_PASS
        ? { user: SMTP_USER, pass: SMTP_PASS }
        : undefined,
  });

  return transporter;
}

/**
 * Verify SMTP connectivity/credentials once, so misconfiguration surfaces
 * clearly in the logs instead of silently failing on the first send.
 * Safe to call at startup; a no-op (with an info log) when SMTP is unset.
 */
let verified = false;
export async function verifyMailTransport(): Promise<boolean> {
  if (verified) return true;
  const mailer = getTransporter();
  if (!mailer) {
    logger.info(
      "[Mailer] SMTP not configured (SMTP_HOST blank) — password reset links will be logged, not emailed."
    );
    return false;
  }
  try {
    await mailer.verify();
    verified = true;
    logger.info(`[Mailer] SMTP connection verified (${process.env.SMTP_HOST})`);
    return true;
  } catch (err: any) {
    logger.error(
      `[Mailer] SMTP verification failed (${process.env.SMTP_HOST}): ${err.message}`
    );
    return false;
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
): Promise<void> {
  const from = process.env.SMTP_FROM || "no-reply@pmms.local";
  const subject = "Reset your PMMS password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Password reset request</h2>
      <p>We received a request to reset your PMMS password. Click the button below to choose a new password. This link expires soon and can only be used once.</p>
      <p style="margin: 24px 0;">
        <a href="${resetLink}" style="background:#4f46e5;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">Reset password</a>
      </p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p style="color:#888;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  const mailer = getTransporter();

  // No SMTP configured (e.g. local dev) — log the link instead of failing.
  if (!mailer) {
    logger.warn(
      `[Mailer] SMTP not configured. Password reset link for ${to}: ${resetLink}`
    );
    return;
  }

  try {
    await mailer.sendMail({ from, to, subject, html });
    logger.info(`[Mailer] Password reset email sent to ${to}`);
  } catch (err: any) {
    logger.error(`[Mailer] Failed to send reset email to ${to}: ${err.message}`);
    throw err;
  }
}
