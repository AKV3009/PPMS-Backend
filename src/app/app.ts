import express from "express";
import authRouter from "../routes/auth.routes";
import cors from "cors";
import employeeRouter from "../routes/employee.routes";
import departmentRouter from "../routes/department.routes";
import dealerRouter from "../routes/dealer.routes";
import sheetRouter from "../routes/sheet.routes";
import sizeRouter from "../routes/size.routes";

const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:4200",
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

app.use("/auth", authRouter);
app.use("/employee", employeeRouter);
app.use("/department", departmentRouter);
app.use("/dealer", dealerRouter);
app.use("/sheet", sheetRouter);
app.use("/size", sizeRouter);

export default app;