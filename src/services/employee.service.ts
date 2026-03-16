import { Between } from "typeorm/find-options/operator/Between";
import { AppDataSource } from "../config/client";
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "../entities/DTOs/employee.dtos";
import { Employee } from "../entities/employee.entity";
import { Sheet } from "../entities/sheet.entity";

export class EmployeeService {
  private repo = AppDataSource.getRepository(Employee);
  
    private sheetRepo = AppDataSource.getRepository(Sheet);

  async getAll(page: number, limit: number) {
    try {
      const [data, total] = await this.repo.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { id: "DESC" },
        relations:{department :true}
      });

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async getById(id: number) {
    try {
      if (!id || id <= 0) {
        throw new Error("INVALID_ID");
      }

      const employee = await this.repo.findOne({
        where: { id },
      });

      if (!employee) {
        throw new Error("EMPLOYEE_NOT_FOUND");
      }

      return employee;
    } catch (err) {
      throw err;
    }
  }

  async create(dto: CreateEmployeeDto) {
    try {
      if (!dto.firstName || dto.firstName.trim() === "") {
        throw new Error("INVALID_FIRST_NAME");
      }

      if (!dto.lastName || dto.lastName.trim() === "") {
        throw new Error("INVALID_LAST_NAME");
      }

      if (!dto.email || dto.email.trim() === "") {
        throw new Error("INVALID_EMAIL");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.email)) {
        throw new Error("INVALID_EMAIL_FORMAT");
      }

      const exists = await this.repo.findOne({
        where: { email: dto.email },
      });

      if (exists) {
        throw new Error("EMPLOYEE_EXISTS");
      }

      const employee = this.repo.create(dto);
      return await this.repo.save(employee);
    } catch (err) {
      throw err;
    }
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    try {
      const employee = await this.getById(id);

      if (dto.firstName !== undefined && dto.firstName.trim() === "") {
        throw new Error("INVALID_FIRST_NAME");
      }

      if (dto.lastName !== undefined && dto.lastName.trim() === "") {
        throw new Error("INVALID_LAST_NAME");
      }

      if (dto.email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dto.email)) {
          throw new Error("INVALID_EMAIL_FORMAT");
        }

        const exists = await this.repo.findOne({
          where: { email: dto.email },
        });

        if (exists && exists.id !== id) {
          throw new Error("EMAIL_EXISTS");
        }
      }

      Object.assign(employee, dto);
      return await this.repo.save(employee);
    } catch (err) {
      throw err;
    }
  }

  async softDelete(id: number) {
    try {
      const employee = await this.getById(id);
      employee.isDeleted = true;
      employee.isActive = false;

      return await this.repo.save(employee);
    } catch (err) {
      throw err;
    }
  }

  async hardDelete(id: number) {
    try {
      const employee = await this.getById(id);
      await this.repo.remove(employee);
      return true;
    } catch (err) {
      throw err;
    }
  }
// employee.service.ts
async getMonthlySalaryReport(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // 1. Fetch all sheets for the month with every relation needed for the math
  const sheets = await this.sheetRepo.find({
    where: { cuttingDate: Between(startDate, endDate) },
    relations: [
      'issues', 
      'issues.frontEmployee', 
      'issues.backEmployee', 
      'issues.tps', 
      'calculations'
    ],
  });

  const reportMap = new Map<number, any>();

  sheets.forEach((sheet) => {
    sheet.issues.forEach((issue) => {
      // 2. Auto-calculate for Front side worker
      if (issue.frontEmployee) {
        this.autoCalculate(reportMap, issue.frontEmployee, sheet, issue, 'FRONT');
      }
      // 3. Auto-calculate for Back side worker
      if (issue.backEmployee) {
        this.autoCalculate(reportMap, issue.backEmployee, sheet, issue, 'BACK');
      }
    });
  });

  return Array.from(reportMap.values());
}

private autoCalculate(map: Map<number, any>, emp: any, sheet: Sheet, issue: any, dept: 'FRONT' | 'BACK') {
  // Use the rate defined on the sheet for the specific side
  const rate = dept === 'FRONT' ? Number(sheet.frontRate) : Number(sheet.backRate);
  
  // Get TP Numbers this specific employee worked on in this issue
  const workerTpValues = issue.tps.map((t: any) => t.tpValue);
  
  // CROSS-REFERENCE: Find the pieces from the calculations array matching these TPs
  const pcs = (sheet.calculations || [])
    .filter((c) => workerTpValues.includes(c.tpValue))
    .reduce((sum, c) => sum + Number(c.rowTotal || 0), 0);

  if (pcs === 0) return; // Skip if no pieces were recorded

  const key = emp.id;
  if (!map.has(key)) {
    map.set(key, {
      employeeName: `${emp.firstName} ${emp.lastName}`,
      dept: emp.department?.name || dept, // Use actual dept or current role
      totalPcs: 0,
      totalSalary: 0,
      workDetails: [],
    });
  }

  const entry = map.get(key);
  entry.totalPcs += pcs;
  entry.totalSalary += (pcs * rate);
  entry.workDetails.push({
    lotNo: sheet.lotNumber,
    bales: workerTpValues.join(', '), // Comma separated bale numbers
    side: dept,
    pcs: pcs,
    rate: rate,
    amount: pcs * rate,
    date: sheet.cuttingDate
  });
}}