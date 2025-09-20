import express from "express";
import { Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserServices"; // ✅ Import UserService
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";

const router = express.Router();
const userRepository=AppDataSource.getRepository(User)
const userService = new UserService(userRepository); // ✅ Create UserService instance
const authController = new AuthController(userService); // ✅ Inject into AuthController

router.post("/register", (req: Request, res: Response) => {
    authController.register(req as any, res); // You might need to type cast req
});

export default router;