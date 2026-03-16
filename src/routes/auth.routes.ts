import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authRouter = Router();
const controller = new AuthController();

authRouter.post("/register", controller.register.bind(controller));
authRouter.post("/login", controller.login.bind(controller));
authRouter.post("/refresh", controller.refresh.bind(controller));
authRouter.post("/logout", controller.logout.bind(controller));

export default authRouter;
