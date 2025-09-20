import { Request, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserServices"; // Make sure import path is correct

export class AuthController {
    private userService: UserService;
    
    constructor(userService: UserService) { // ✅ Accept UserService as parameter
        this.userService = userService;
    }

    async register(req: RegisterUserRequest, res: Response) {
        const { firstName, lastName, email, password } = req.body;
     
        await this.userService.create({ firstName, lastName, email, password });
        
        return res.status(201).json({ message: "User registered successfully" });
    }
}