import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserServices";
import { Logger } from "winston";
import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken"; // Fixed import
const { sign } = jwt; // Destructure sign
import { validationResult } from "express-validator"; // Fixed typo
import { Config } from "../config/index";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/refreshToken"; // Import the actual entity
import { TokenService } from "../services/TokenServices";

export class AuthController {
    private userService: UserService;

    constructor(userService: UserService, private logger: Logger, private tokenService: TokenService) {
        this.userService = userService;
    }

    async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req); // Fixed typo
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, email, password } = req.body;
        this.logger.info("a new request to register a user", {
            firstName, lastName, email
        });

        try {
            const user = await this.userService.create({ 
                firstName, 
                lastName, 
                email, 
                password 
            });
            this.logger.info("user registered successfully", { id: user.id });
            
            const payload:JwtPayload = { // Fixed: removed JwtPayload type if causing issues
                sub: String(user.id), // Fixed: use String() instead of toString()
                role: user.role
            };
            const accessToken = this.tokenService.generateAccessToken(payload);
            // Check if refresh token secret is available
            if (!Config.REFRESH_TOKEN_SECRET) {
                const error = createHttpError(500, "Refresh token secret not configured");
                next(error);
                return;
            }
            // Persist the refresh token in db
            const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
            const refreshTokenRepository = AppDataSource.getRepository(RefreshToken); // Use actual entity
            const newRefreshToken = await refreshTokenRepository.save({
                user: user,
                expiresAt: new Date(Date.now() + MS_IN_YEAR),
            });
                       
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });


           
            // Set cookies
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                domain: "localhost",
                maxAge: 1000 * 60 * 60, // 1 hour
                sameSite: "lax",
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                domain: "localhost",
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
                sameSite: "lax",
            });

            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
        }
    }
    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req); // Fixed typo
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { email, password } = req.body;
        this.logger.info("a new request to login a user", {
            email,
            password: "******"
        });
        

    }

}