import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        return res.status(400).json({ message: "A valid email is required" });
      }
      if (!password || typeof password !== "string" || password.length < 8) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters" });
      }
      if (name !== undefined && typeof name !== "string") {
        return res.status(400).json({ message: "Name must be a string" });
      }

      const user = await authService.register(email, password, name);
      res.status(201).json({ id: user.id });
    } catch (err: any) {
      if (err.message === "EMAIL_EXISTS") {
        return res.status(409).json({ message: "Email already exists" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const tokens = await authService.login(email, password);
      res.json(tokens);
    } catch (err: any) {
      if (err.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const token = await authService.refresh(refreshToken);
      res.json(token);
    } catch {
      res.status(401).json({ message: "Invalid refresh token" });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      res.json({ message: "Logged out" });
    } catch {
      res.status(500).json({ message: "Logout failed" });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      await authService.forgotPassword(email);
      // Always return the same response so accounts can't be enumerated.
      res.json({
        message: "If that email exists, a password reset link has been sent.",
      });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async validateResetToken(req: Request, res: Response) {
    try {
      const token = String(req.query.token || "");
      const valid = await authService.validateResetToken(token);
      res.json({ valid });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res
          .status(400)
          .json({ message: "Token and new password are required" });
      }
      if (password.length < 8) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters" });
      }
      await authService.resetPassword(token, password);
      res.json({ message: "Password has been reset successfully" });
    } catch (err: any) {
      if (err.message === "INVALID_RESET_TOKEN") {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }
}