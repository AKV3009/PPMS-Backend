import { Router } from "express";
import { DealerController } from "../controllers/dealer.controller";

const dealerRouter = Router();
const controller = new DealerController();

dealerRouter.get("/", controller.getAllDealers.bind(controller));
dealerRouter.get("/:id", controller.getDealerById.bind(controller));
dealerRouter.post("/", controller.saveDealer.bind(controller));
dealerRouter.put("/:id", controller.saveDealer.bind(controller));
dealerRouter.delete("/:id", controller.deleteDealer.bind(controller));

export default dealerRouter;
