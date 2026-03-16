import { Router } from "express";
import { SizeController } from "../controllers/size.controller";

const sizeRouter = Router();
const controller = new SizeController();

// #swagger.tags = ['Sizes']
sizeRouter.get("/", controller.getAll.bind(controller));
// #swagger.tags = ['Sizes']
sizeRouter.get("/:id", controller.getById.bind(controller));

export default sizeRouter;