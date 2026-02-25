
import "reflect-metadata"
import express from "express";
import logger from "./config/logger";
import { Request, Response, NextFunction } from "express";
import createHttpError, { HttpError } from "http-errors";
import cookieParser from "cookie-parser";
import authroutes from "./routes/auth";
import tenantrouter from"./routes/tenant"
import userrouter from "./routes/user"
import cors from "cors"
const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }));

app.get("/",async  (req: Request, res: Response,next: NextFunction) => {
    const error = createHttpError(418, "This is a custom error message");
    next(error);
});
app.use("/auth",authroutes)
app.use("/tenant",tenantrouter)
app.use("/users",userrouter)



// Error handling middleware
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.status || 500;
    
    res.status(statusCode).json({
        message: err.message,
        type: err.name || "Internal Server Error",
        path: req.path,
        status: statusCode
    });
});

export default app;