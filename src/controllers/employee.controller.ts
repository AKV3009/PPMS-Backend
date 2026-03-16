import { Request, Response } from "express";
import { EmployeeService } from "../services/employee.service";

const service = new EmployeeService();

export class EmployeeController {
  async getAll(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      if (page <= 0 || limit <= 0) {
        return res
          .status(400)
          .json({ message: "Page and limit must be positive numbers" });
      }

      const data = await service.getAll(page, limit);
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!id || isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const employee = await service.getById(id);
      res.status(200).json(employee);
    } catch (err: any) {
      if (err.message === "INVALID_ID") {
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (err.message === "EMPLOYEE_NOT_FOUND") {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, departmentId } = req.body;

      if (!firstName || typeof firstName !== "string") {
        return res
          .status(400)
          .json({ message: "firstName is required and must be a string" });
      }

      if (!lastName || typeof lastName !== "string") {
        return res
          .status(400)
          .json({ message: "lastName is required and must be a string" });
      }

      if (!email || typeof email !== "string") {
        return res
          .status(400)
          .json({ message: "email is required and must be a string" });
      }

      if (departmentId !== undefined && typeof departmentId !== "number") {
        return res
          .status(400)
          .json({ message: "departmentId must be a number" });
      }

      const employee = await service.create({
        firstName,
        lastName,
        email,
        departmentId,
      });

      res.status(201).json(employee);
    } catch (err: any) {
      if (err.message === "INVALID_FIRST_NAME") {
        return res.status(400).json({ message: "firstName cannot be empty" });
      }
      if (err.message === "INVALID_LAST_NAME") {
        return res.status(400).json({ message: "lastName cannot be empty" });
      }
      if (err.message === "INVALID_EMAIL") {
        return res.status(400).json({ message: "email cannot be empty" });
      }
      if (err.message === "INVALID_EMAIL_FORMAT") {
        return res.status(400).json({ message: "Invalid email format" });
      }
      if (err.message === "EMPLOYEE_EXISTS") {
        return res.status(409).json({ message: "Employee already exists" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { firstName, lastName, email, departmentId } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      if (firstName !== undefined && typeof firstName !== "string") {
        return res.status(400).json({ message: "firstName must be a string" });
      }

      if (lastName !== undefined && typeof lastName !== "string") {
        return res.status(400).json({ message: "lastName must be a string" });
      }

      if (email !== undefined && typeof email !== "string") {
        return res.status(400).json({ message: "email must be a string" });
      }

      if (departmentId !== undefined && typeof departmentId !== "number") {
        return res
          .status(400)
          .json({ message: "departmentId must be a number" });
      }

      const employee = await service.update(id, {
        firstName,
        lastName,
        email,
        departmentId,
      });

      res.status(200).json(employee);
    } catch (err: any) {
      if (err.message === "INVALID_ID") {
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (err.message === "EMPLOYEE_NOT_FOUND") {
        return res.status(404).json({ message: "Employee not found" });
      }
      if (err.message === "INVALID_FIRST_NAME") {
        return res.status(400).json({ message: "firstName cannot be empty" });
      }
      if (err.message === "INVALID_LAST_NAME") {
        return res.status(400).json({ message: "lastName cannot be empty" });
      }
      if (err.message === "INVALID_EMAIL_FORMAT") {
        return res.status(400).json({ message: "Invalid email format" });
      }
      if (err.message === "EMAIL_EXISTS") {
        return res.status(409).json({ message: "Email already exists" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async softDelete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!id || isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      await service.softDelete(id);
      res.status(200).json({ message: "Employee soft deleted successfully" });
    } catch (err: any) {
      if (err.message === "INVALID_ID") {
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (err.message === "EMPLOYEE_NOT_FOUND") {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async hardDelete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!id || isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      await service.hardDelete(id);
      res.status(204).send();
    } catch (err: any) {
      if (err.message === "INVALID_ID") {
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (err.message === "EMPLOYEE_NOT_FOUND") {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getSalaryReport(req: Request, res: Response) {
    try {
      const month = Number(req.query.month);
      const year = Number(req.query.year);

      // Validation
      if (!month || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Valid month (1-12) is required" });
      }
      if (!year || isNaN(year)) {
        return res.status(400).json({ message: "Valid year is required" });
      }

      // Auto-calculation logic is triggered here within the service
      const report = await service.getMonthlySalaryReport(month, year);
      
      res.status(200).json({
        data: report,
        meta: {
          month,
          year,
          count: report.length
        }
      });
    } catch (err: any) {
      console.error("[SALARY_REPORT_ERROR]:", err);
      res.status(500).json({ message: "Internal server error while calculating salary" });
    }
  }
}
