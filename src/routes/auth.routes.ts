import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authRouter = Router();
const controller = new AuthController();

authRouter.post("/register", controller.register.bind(controller));
authRouter.post("/login", controller.login.bind(controller));
authRouter.post("/refresh", controller.refresh.bind(controller));
authRouter.post("/logout", controller.logout.bind(controller));
authRouter.post("/forgot-password", controller.forgotPassword.bind(controller));
authRouter.get("/reset-password/validate", controller.validateResetToken.bind(controller));
authRouter.post("/reset-password", controller.resetPassword.bind(controller));

export default authRouter;
