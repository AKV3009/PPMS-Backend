import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body; 
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
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ message: "Logged out" });
  }
}
