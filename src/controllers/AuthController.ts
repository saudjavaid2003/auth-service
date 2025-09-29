import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserServices"; // Make sure import path is correct
import { Logger } from "winston";
import createHttpError from "http-errors";
import {JwtPayload, sign} from "jsonwebtoken";
import { validationResult as validatiornResult } from "express-validator";
import { toString } from "express-validator/lib/utils";
import { buffer } from "stream/consumers";

export class AuthController {
    private userService: UserService;
    
    constructor(userService: UserService, private logger: Logger) { 
        this.userService = userService;
    }

    async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const result = validatiornResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, email, password } = req.body;
        this.logger.info("a new request to register a user", {
            firstName, lastName, email
        });

        try {
            const user = await this.userService.create({ firstName, lastName, email, password });
            this.logger.info("user registered successfully", { id: user.id });
            let privateKey:Buffer;
            try{
                privateKey=fs.readFileSync(path.join(__dirname,"../../certs/private.pem"));


            }
            catch(err){
                const error=createHttpError(500,"unable to read private key");
                next(error);
                return ;
            }

            const payload:JwtPayload={
                sub:toString(user.id),
                role:user.role

            }
            

            const accessToken = sign(payload,privateKey,{
                expiresIn:"1h",
                algorithm:"RS256",
                issuer:"auth-service",

            });
            

            const refreshToken = "dummyRefresh";

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                domain: "localhost", // 🔹 use lowercase "domain"
                maxAge: 1000 * 60 * 60, // 🔹 fixed "&" to "*"
                sameSite: "lax",       // 🔹 fixed true → string value
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                domain: "localhost",
                maxAge: 1000 * 60 * 60 * 24 * 7,
                sameSite: "lax",
            });

            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
        }
    }
}
