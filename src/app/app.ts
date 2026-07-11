import express from "express";
import authRouter from "../routes/auth.routes";
import cors from "cors";
import employeeRouter from "../routes/employee.routes";
import departmentRouter from "../routes/department.routes";
import dealerRouter from "../routes/dealer.routes";
import sheetRouter from "../routes/sheet.routes";
import sizeRouter from "../routes/size.routes";
import { authMiddleware } from "../middleware/auth";

const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:4200",
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// Public auth routes (login, register, refresh, password reset)
app.use("/auth", authRouter);

// Everything below requires a valid access token
app.use("/employee", authMiddleware, employeeRouter);
app.use("/department", authMiddleware, departmentRouter);
app.use("/dealer", authMiddleware, dealerRouter);
app.use("/sheet", authMiddleware, sheetRouter);
app.use("/size", authMiddleware, sizeRouter);

export default app;