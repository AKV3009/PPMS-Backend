import { Request, Response } from "express";
import { DepartmentService } from "../services/department.service";
import logger from "../utils/logger";

const service = new DepartmentService();

export class DepartmentController {
  async getAllDepartments(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      logger.info(
        `[DepartmentController] GET /departments - Page: ${page}, Limit: ${limit}`
      );

      if (page <= 0 || limit <= 0) {
        logger.warn(`[DepartmentController] Invalid pagination parameters`);
        return res
          .status(400)
          .json({ message: "Page and limit must be positive numbers" });
      }

      const data = await service.getAll(page, limit);
      logger.info(`[DepartmentController] Successfully retrieved departments`);
      res.status(200).json(data);
    } catch (err: any) {
      logger.error(`[DepartmentController] Error in getAll: ${err.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      logger.info(`[DepartmentController] GET /departments/${id}`);

      if (!id || isNaN(id)) {
        logger.warn(`[DepartmentController] Invalid ID provided: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID" });
      }

      const department = await service.getDepartmentById(id);
      logger.info(
        `[DepartmentController] Successfully retrieved department ${id}`
      );
      res.status(200).json(department);
    } catch (err: any) {
      if (err.message === "INVALID_ID") {
        logger.warn(`[DepartmentController] Invalid ID: ${err.message}`);
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (err.message === "DEPARTMENT_NOT_FOUND") {
        logger.warn(`[DepartmentController] Department not found`);
        return res.status(404).json({ message: "Department not found" });
      }
      logger.error(`[DepartmentController] Error in getById: ${err.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  }

async saveDepartment(req: Request, res: Response) {
  try {
    const id = Number(req.params.id) || 0; // Default to 0 for creation
    const { departmentName, isActive } = req.body;

    // 1. Logging the Intent
    const action = id === 0 ? "Creating" : `Updating (ID: ${id})`;
    logger.info(`[DepartmentController] Save request - ${action}: ${departmentName}`);

    // 2. Validation Guard Clauses
    if (id !== 0 && isNaN(id)) {
      logger.warn(`[DepartmentController] Invalid ID provided: ${id}`);
      return res.status(400).json({ message: "Invalid ID" });
    }

    // Validate departmentName (Required for Create)
    if (id === 0 && (!departmentName || typeof departmentName !== "string")) {
      logger.warn(`[DepartmentController] Validation failed: departmentName required`);
      return res.status(400).json({ message: "departmentName is required and must be a string" });
    }

    let result;
    if (id === 0) {
      // Logic for Create
      result = await service.saveDepartment({ departmentName });
      logger.info(`[DepartmentController] Successfully created department: ${result.id}`);
      return res.status(201).json(result);
    } else {
      // Logic for Update
      result = await service.saveDepartment({ departmentName, isActive },id);
      logger.info(`[DepartmentController] Successfully updated department: ${id}`);
      return res.status(200).json(result);
    }

  } catch (err: any) {
    return this.handleDepartmentError(res, err);
  }
}

/**
 * Shared Error Handler for Department operations
 */
private handleDepartmentError(res: Response, err: any) {
  const errorMap: Record<string, number> = {
    "INVALID_ID": 400,
    "INVALID_DEPARTMENT_NAME": 400,
    "DEPARTMENT_NOT_FOUND": 404,
    "DEPARTMENT_EXISTS": 409,
    "DEPARTMENT_NAME_EXISTS": 409,
  };

  const status = errorMap[err.message] || 500;

  if (status >= 500) {
    logger.error(`[DepartmentController] Unexpected Error: ${err.message}`);
  } else {
    logger.warn(`[DepartmentController] Handled Error: ${err.message}`);
  }

  return res.status(status).json({
    message: status === 500 
      ? "Internal server error" 
      : err.message.replace(/_/g, ' ').toLowerCase()
  });
}
  async DeleteDepartment(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      logger.info(`[DepartmentController] PATCH /departments/${id}/soft-delete`);

      if (!id || isNaN(id)) {
        logger.warn(`[DepartmentController] Invalid ID provided`);
        return res.status(400).json({ message: "Invalid ID" });
      }

      await service.softDelete(id);
      logger.info(
        `[DepartmentController] Department soft deleted successfully - ID: ${id}`
      );
      res.status(200).json({ message: "Department soft deleted successfully" });
    } catch (err: any) {
      if (err.message === "INVALID_ID") {
        logger.warn(`[DepartmentController] Invalid ID`);
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (err.message === "DEPARTMENT_NOT_FOUND") {
        logger.warn(`[DepartmentController] Department not found`);
        return res.status(404).json({ message: "Department not found" });
      }
      logger.error(
        `[DepartmentController] Error in softDelete: ${err.message}`
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
