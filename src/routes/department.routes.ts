import { Router } from "express";
import { DepartmentController } from "../controllers/department.controller";

const departmentRouter = Router();
const controller = new DepartmentController();

departmentRouter.get("/", controller.getAllDepartments.bind(controller));
departmentRouter.get("/:id", controller.getById.bind(controller));

departmentRouter.post("/", controller.saveDepartment.bind(controller));
departmentRouter.put("/:id", controller.saveDepartment.bind(controller));

departmentRouter.delete("/:id", controller.DeleteDepartment.bind(controller));

export default departmentRouter;
