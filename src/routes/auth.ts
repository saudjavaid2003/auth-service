import express from "express";
import { Request, Response ,NextFunction} from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserServices"; // ✅ Import UserService
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
// import { Logger } from "winston";
import logger from "../config/logger";
import { body } from "express-validator";
import registerValidator from "../validators/register-validator";
const router = express.Router();
const userRepository=AppDataSource.getRepository(User)
const userService = new UserService(userRepository); // ✅ Create UserService instance
const authController = new AuthController(userService,logger); // ✅ Inject into AuthController

router.post("/register",
    registerValidator,
    

    (req: Request, res: Response, next: NextFunction) => {
        authController.register(req as any, res, next);
    }
);

export default router;
