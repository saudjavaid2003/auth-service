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
import {CredentialService} from "../services/CredentialService"
import { AuthRequest } from "../types";
export class AuthController {
  
    

    constructor( private userService: UserService,
         private logger: Logger,
          private tokenService: TokenService,
          private credentialService: CredentialService
        ) {
    
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
        try{
            const user=await this.userService.findByEnail(email)
            if(!user){
                const error=createHttpError(400,"email is not registered")
                next(error)
                return
            }
            const passwordMatch= await this.credentialService.comparePassword(password,user.password)
            if(!passwordMatch){
                const error=createHttpError(400,"email or password is incorrect")
                next(error)
                return
            }
            
            const payload:JwtPayload = { // Fixed: removed JwtPayload type if causing issues
                sub: String(user.id), // Fixed: use String() instead of toString()
                role: user.role
            };
            const accessToken = await  this.tokenService.generateAccessToken(payload);
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
                       
            const refreshToken = await this.tokenService.generateRefreshToken({
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
            this.logger.info("User has been logged in", { id: user.id });

            res.status(200).json({ id: user.id });



        }
        catch(err){
            next(err)
        }
        

    }

    // self handler 
    async self(req: AuthRequest, res: Response) {
    console.log("Cookies:", req.cookies);
    console.log("Auth object:", req.auth);

    // Check if JWT middleware decoded the token
    if (!req.auth || !req.auth.sub) {
      console.error("Token is missing or invalid");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = Number(req.auth.sub); // Convert to number
    const user = await this.userService.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      password: undefined, // never return password
    });
  }
   async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: req.auth.sub,
                role: req.auth.role,
                tenant: req.auth.tenant,
                firstName: req.auth.firstName,
                lastName: req.auth.lastName,
                email: req.auth.email,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const user = await this.userService.findById(Number(req.auth.sub));
            if (!user) {
                const error = createHttpError(
                    400,
                    "User with the token could not find",
                );
                next(error);
                return;
            }

            // Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // Delete old refresh token
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 1, // 1d
                httpOnly: true, // Very important
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true, // Very important
            });

            this.logger.info("User has been logged in", { id: user.id });
            res.json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }


}