import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/users.entity";
import { RefreshToken } from "../entities/refreshToken.entity";
import dotenv from "dotenv";
import { Dealer } from "../entities/dealers.entity";
import { Issue } from "../entities/issue.entity";
import { Sheet } from "../entities/sheet.entity";
import { Department } from "../entities/departments.entity";
import { Size } from "../entities/sizes.entity";
import { Tp } from "../entities/tp.entity";
import { SizeConfig } from "../entities/sizeConfigs.entity";
import { SheetCalculation } from "../entities/sheetCalculation.entity";
import { Employee } from "../entities/employee.entity";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [
    User,
    RefreshToken,
    Department,
    Employee,
    Dealer,
    
    //TODO Work on this

    Tp,
    Issue,
    Size,
    SizeConfig,
    Sheet,
    SheetCalculation
  ],
});
