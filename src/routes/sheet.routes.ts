import { Router } from "express";
import { SheetController } from "../controllers/sheet.controller";

const sheetRouter = Router();
const controller = new SheetController();

// #swagger.tags = ['Sheets']
sheetRouter.get("/", controller.getAll.bind(controller));
// #swagger.tags = ['Sheets']
sheetRouter.get("/:id", controller.getById.bind(controller));
// #swagger.tags = ['Sheets']
sheetRouter.post("/", controller.SaveProject.bind(controller));
// #swagger.tags = ['Sheets']
sheetRouter.put("/:id", controller.SaveProject.bind(controller));
// #swagger.tags = ['Sheets']
sheetRouter.delete("/:id", controller.delete.bind(controller));

sheetRouter.get('/:id/pdf', controller.downloadPdf.bind(controller));

export default sheetRouter;
