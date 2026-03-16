import { AppDataSource } from "../config/client";
import { Department } from "../entities/departments.entity";
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from "../entities/DTOs/department.dtos";
import logger from "../utils/logger";

export class DepartmentService {
  private repo = AppDataSource.getRepository(Department);

  async getAll(page: number, limit: number) {
    try {
      logger.info(
        `[DepartmentService] Fetching all departments - Page: ${page}, Limit: ${limit}`
      );

      const [data, total] = await this.repo.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { id: "DESC" },
      });

      logger.info(
        `[DepartmentService] Successfully fetched ${data.length} departments`
      );

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err: any) {
      logger.error(
        `[DepartmentService] Error fetching departments: ${err.message}`
      );
      throw err;
    }
  }

  async getDepartmentById(id: number) {
    try {
      logger.info(`[DepartmentService] Fetching department with ID: ${id}`);

      if (!id || id <= 0) {
        logger.warn(`[DepartmentService] Invalid ID provided: ${id}`);
        throw new Error("INVALID_ID");
      }

      const department = await this.repo.findOne({ where: { id } });

      if (!department) {
        logger.warn(
          `[DepartmentService] Department not found with ID: ${id}`
        );
        throw new Error("DEPARTMENT_NOT_FOUND");
      }

      logger.info(
        `[DepartmentService] Successfully fetched department: ${department.departmentName}`
      );
      return department;
    } catch (err: any) {
      logger.error(`[DepartmentService] Error fetching department: ${err.message}`);
      throw err;
    }
  }
  async saveDepartment(dto: any, id: number = 0) {
    try {
      const isNew = id === 0;
      logger.info(
        `[DepartmentService] ${isNew ? 'Creating' : 'Updating'} department${!isNew ? ' ID: ' + id : ''}: ${dto.departmentName}`
      );

      // 1. Validation: Name cannot be empty if provided
      if (dto.departmentName !== undefined && dto.departmentName.trim() === "") {
        logger.warn(`[DepartmentService] Validation failed: departmentName cannot be empty`);
        throw new Error("INVALID_DEPARTMENT_NAME");
      }

      // 2. Existence Check (Duplicate Name Check)
      if (dto.departmentName) {
        const exists = await this.repo.findOne({
          where: { departmentName: dto.departmentName , isActive: dto.isActive },
        });

        if (exists) {
          if (isNew || exists.id !== id) {
            logger.warn(`[DepartmentService] Department name already exists: ${dto.departmentName}`);
            throw new Error(isNew ? "DEPARTMENT_EXISTS" : "DEPARTMENT_NAME_EXISTS");
          }
        }
      }

      let department: any;

      if (isNew) {
        // 3a. Create Logic
        if (!dto.departmentName) throw new Error("INVALID_DEPARTMENT_NAME");
        department = this.repo.create(dto);
      } else {
        // 3b. Update Logic
        department = await this.getDepartmentById(id);
        Object.assign(department, dto);
      }

      const result = await this.repo.save(department);
      logger.info(`[DepartmentService] Department ${isNew ? 'created' : 'updated'} successfully - ID: ${result.id}`);

      return result;

    } catch (err: any) {
      logger.error(`[DepartmentService] Error saving department: ${err.message}`);
      throw err;
    }
  }
  async softDelete(id: number) {
    try {
      logger.info(
        `[DepartmentService] Soft deleting department with ID: ${id}`
      );

      const department = await this.getDepartmentById(id);
      department.isActive = false;
      const updated = await this.repo.save(department);

      logger.info(
        `[DepartmentService] Department soft deleted successfully - ID: ${id}`
      );
      return updated;
    } catch (err: any) {
      logger.error(
        `[DepartmentService] Error soft deleting department: ${err.message}`
      );
      throw err;
    }
  }

}
