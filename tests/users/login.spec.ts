import { DataSource } from "typeorm";
import bcrypt from "bcryptjs";
// tests/users/register.spec.ts - Add this at the very top
import { describe, beforeAll, beforeEach, afterAll, afterEach, it, expect } from '@jest/globals';
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { isJwt } from "../utils";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("POST /auth/login", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        // Sync database once
        await connection.synchronize();
    });

    beforeEach(async () => {
        // DISABLE foreign key constraints temporarily
        await connection.query('ALTER TABLE "refreshTokens" DISABLE TRIGGER ALL;');
        
        // Delete all records using raw SQL (in correct order)
        await connection.query('DELETE FROM "refreshTokens";');
        await connection.query('DELETE FROM "users";');
        
        // RE-ENABLE foreign key constraints
        await connection.query('ALTER TABLE "refreshTokens" ENABLE TRIGGER ALL;');
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should return the access token and refresh token inside a cookie", async () => {
            // Arrange
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password",
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // Act
            const response = await request(app)
                .post("/auth/login")
                .send({ email: userData.email, password: userData.password });

            // Assert - Check login succeeded first
            expect(response.statusCode).toBe(200);

            const setCookieHeader = response.headers["set-cookie"];
            const cookies = Array.isArray(setCookieHeader)
                ? setCookieHeader
                : (setCookieHeader ? [setCookieHeader] : []);

            // Check cookies exist
            expect(cookies.length).toBeGreaterThan(0);

            let accessToken: string | null = null;
            let refreshToken: string | null = null;

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJwt(accessToken!)).toBeTruthy();
            expect(isJwt(refreshToken!)).toBeTruthy();
        });

        it("should return 400 if email or password is wrong", async () => {
            // Arrange
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password",
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // Act
            const response = await request(app)
                .post("/auth/login")
                .send({ email: userData.email, password: "wrongPassword" });

            // Assert
            expect(response.statusCode).toBe(400);
        });
    });
});