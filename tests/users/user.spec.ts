import { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("GET /auth/self", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should return the status code 200", async () => {
            // ✅ Save a user so /self can find it
            const userRepository = connection.getRepository(User);
            const user = await userRepository.save({
                firstName: "Test",
                lastName: "User",
                email: "testuser@example.com",
                password: "password",
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(user.id), // use the actual saved user's id
                role: user.role,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();

            expect(response.statusCode).toBe(200);
        });

        it("should return the user data", async () => {
            const userData = {
                firstName: "saud",
                lastName: "javiad",
                email: "saudjavaid2003@gmail.com",
                password: "password",
            };
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            expect((response.body as Record<string, string>).id).toBe(data.id);
        });
    });
     it("should not return the password field", async () => {
            // Register user
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password",
            };
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });
            // Generate token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            // Add token to cookie
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();
            // Assert
            // Check if user id matches with registered user
            expect(response.body as Record<string, string>).not.toHaveProperty(
                "password",
            );
        });

});
