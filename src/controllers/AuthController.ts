import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserServices";
import { Logger } from "winston";
import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
const { sign } = jwt;

import { validationResult } from "express-validator";
import { Config } from "../config/index";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/refreshToken";
import { TokenService } from "../services/TokenServices";
import { CredentialService } from "../services/CredentialService";
import { AuthRequest } from "../types";
import { Roles } from "../constants";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction
    ) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, email, password } = req.body;

        this.logger.info("a new request to register a user", {
            firstName,
            lastName,
            email,
        });

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.CUSTOMER,
            });

            this.logger.info("user registered successfully", {
                id: user.id,
            });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
                tenant: user.tenant ? String(user.tenant.id) : "",
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            };

            const accessToken =
                this.tokenService.generateAccessToken(payload);

            if (!Config.REFRESH_TOKEN_SECRET) {
                const error = createHttpError(
                    500,
                    "Refresh token secret not configured"
                );

                next(error);
                return;
            }

            const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken);

            const newRefreshToken = await refreshTokenRepository.save({
                user: user,
                expiresAt: new Date(Date.now() + MS_IN_YEAR),
            });

            const refreshToken =
                this.tokenService.generateRefreshToken({
                    ...payload,
                    id: String(newRefreshToken.id),
                });

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                domain: Config.MAIN_DOMAIN,
                maxAge: 1000 * 60 * 60, // 1 hour
                sameSite: "lax",
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                domain: Config.MAIN_DOMAIN,
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                sameSite: "lax",
            });

            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
        }
    }

    async login(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction
    ) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { email, password } = req.body;

        this.logger.info("a new request to login a user", {
            email,
            password: "******",
        });

        try {
            const user =
                await this.userService.findByEmailWithPassword(email);

            if (!user) {
                const error = createHttpError(
                    400,
                    "email is not registered"
                );

                next(error);
                return;
            }

            const passwordMatch =
                await this.credentialService.comparePassword(
                    password,
                    user.password
                );

            if (!passwordMatch) {
                const error = createHttpError(
                    400,
                    "email or password is incorrect"
                );

                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
                tenant: user.tenant ? String(user.tenant.id) : "",
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            };

            const accessToken =
                await this.tokenService.generateAccessToken(payload);

            if (!Config.REFRESH_TOKEN_SECRET) {
                const error = createHttpError(
                    500,
                    "Refresh token secret not configured"
                );

                next(error);
                return;
            }

            const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken);

            const newRefreshToken = await refreshTokenRepository.save({
                user: user,
                expiresAt: new Date(Date.now() + MS_IN_YEAR),
            });

            const refreshToken =
                await this.tokenService.generateRefreshToken({
                    ...payload,
                    id: String(newRefreshToken.id),
                });

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                domain: Config.MAIN_DOMAIN,
                maxAge: 1000 * 60 * 60, // 1 hour
                sameSite: "lax",
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                domain: Config.MAIN_DOMAIN,
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                sameSite: "lax",
            });

            this.logger.info("User has been logged in", {
                id: user.id,
            });

            res.status(200).json({ id: user.id });
        } catch (err) {
            next(err);
        }
    }

    async self(req: AuthRequest, res: Response) {
        console.log("Cookies:", req.cookies);
        console.log("Auth object:", req.auth);

        const user = await this.userService.findById(
            Number(req.auth.sub)
        );

        res.json({ ...user, password: undefined });
    }

    async refresh(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) {
        try {
            const payload: JwtPayload = {
                sub: req.auth.sub,
                role: req.auth.role,
                tenant: req.auth.tenant,
                firstName: req.auth.firstName,
                lastName: req.auth.lastName,
                email: req.auth.email,
            };

            const accessToken =
                this.tokenService.generateAccessToken(payload);

            const user = await this.userService.findById(
                Number(req.auth.sub)
            );

            if (!user) {
                const error = createHttpError(
                    400,
                    "User with the token could not find"
                );

                next(error);
                return;
            }

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            await this.tokenService.deleteRefreshToken(
                Number(req.auth.id)
            );

            const refreshToken =
                this.tokenService.generateRefreshToken({
                    ...payload,
                    id: String(newRefreshToken.id),
                });

            res.cookie("accessToken", accessToken, {
                domain: Config.MAIN_DOMAIN,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // ✅ fixed: 1 hour
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: Config.MAIN_DOMAIN,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true,
            });

            this.logger.info("User has been logged in", {
                id: user.id,
            });

            res.json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }

    async logout(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) {
        try {
            await this.tokenService.deleteRefreshToken(
                Number(req.auth.id)
            );

            this.logger.info("Refresh token has been deleted", {
                id: req.auth.id,
            });

            this.logger.info("User has been logged out", {
                id: req.auth.sub,
            });

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            res.json({});
        } catch (err) {
            next(err);
            return;
        }
    }
}