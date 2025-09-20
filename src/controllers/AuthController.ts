import { NextFunction, Request, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserServices"; // Make sure import path is correct
import { Logger } from "winston";

export class AuthController {
    private userService: UserService;
    
    constructor(userService: UserService,private logger :Logger) { // ✅ Accept UserService as parameter
        this.userService = userService;
    }

    async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password } = req.body;
        this.logger.info("a new request to register a user",{
            firstName,lastName,email
        })
        try {
            const user = await this.userService.create({ firstName, lastName, email, password });
            this.logger.info("user registered successfully ",{id:user.id})
            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
        }
    } // ✅ Added missing closing bracket for register method
} // ✅ Added missing closing bracket for AuthController class