import { Router } from "express";
import { EmployeeController } from "../controllers/employee.controller";

const employeeRouter = Router();
const controller = new EmployeeController();

// #swagger.tags = ['Employees']
employeeRouter.get("/salary-report", controller.getSalaryReport.bind(controller));
employeeRouter.get("/", controller.getAll.bind(controller));
// #swagger.tags = ['Employees']
employeeRouter.get("/:id", controller.getById.bind(controller));
// #swagger.tags = ['Employees']
employeeRouter.post("/", controller.create.bind(controller));
// #swagger.tags = ['Employees']
employeeRouter.put("/:id", controller.update.bind(controller));
// #swagger.tags = ['Employees']
employeeRouter.patch("/:id/soft-delete", controller.softDelete.bind(controller));
// #swagger.tags = ['Employees']
employeeRouter.delete("/:id", controller.hardDelete.bind(controller));



export default employeeRouter;