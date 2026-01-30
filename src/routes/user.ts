import express, { RequestHandler } from "express"


import { Request, Response ,NextFunction} from "express";
import {UserController}  from "../controllers/UserController";
import { AppDataSource } from "../config/data-source";
import { UserService } from "../services/UserServices";
import { User } from "../entity/User";

import { Roles } from "../constants";

import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const usercontrooller = new UserController(userService);



router.post("/",authenticate,canAccess([Roles.ADMIN]),(req:Request,res:Response,next:NextFunction)=>{
    usercontrooller.create(req,res,next)
});

export default router;