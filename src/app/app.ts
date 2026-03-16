import express from "express";
import authRouter from "../routes/auth.routes";
import { AppDataSource } from "../config/client";
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerOutput from '../swagger_output.json'
import employeeRouter from "../routes/employee.routes";
import departmentRouter from "../routes/department.routes";
import dealerRouter from "../routes/dealer.routes";
import sheetRouter from "../routes/sheet.routes";
import { authMiddleware } from "../middleware/auth";
import sizeRouter from "../routes/size.routes";


const corsOptions = {
    origin: 'http://localhost:4200', // Allow only requests from this origin
    methods: 'GET,POST,PUT,DELETE,PATCH',
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow only these headers
};


const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// 1. Serve Swagger UI
app.use("/auth", authRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));

app.use(authMiddleware)

AppDataSource.initialize()
.then(() => console.log("Database connected"))
.catch((err) => console.error("DB error", err));
  
app.use("/employee", employeeRouter);
app.use("/department", departmentRouter);
app.use("/dealer", dealerRouter);
app.use("/sheet", sheetRouter);
app.use("/size", sizeRouter);

export default app;
