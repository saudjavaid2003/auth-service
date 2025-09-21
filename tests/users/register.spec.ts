import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { truncateTables } from "../utils";
import { before } from "node:test";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants/index";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase()
        await connection.synchronize();
    
    });

    afterAll(async () => {
        await connection.destroy();
    });

    it("should return 201 when all fields are present", async () => {
        const userdata = {
            firstName: "saudjavaid",
            lastName: "akram",
            email: "saudjavaid2003@gmail.com",
            password: "terimaki",
        };

        const response = await request(app)
            .post("/auth/register")
            .send(userdata);

        expect(response.statusCode).toBe(201);
    });

    it("should return JSON with success message", async () => {
        const userdata = {
            firstName: "saudjavaid",
            lastName: "akram",
            email: "saudjavaid2003@gmail.com",
            password: "terimaki",
        };

        const response = await request(app)
            .post("/auth/register")
            .send(userdata);
        expect(
            (response.headers as Record<string, string>)["content-type"],
        ).toEqual(expect.stringContaining("json"));
    });

    it("should persist the user in the database", async () => {
        // Arrange
        const userData = {
            firstName: "saudjavaid",
            lastName: "K",
            email: "saudjavaid2003@gmail.com",
            password: "terimaki",
        };

        // Act
        await request(app).post("/auth/register").send(userData);

        // Assert
        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();
        expect(users).toHaveLength(1);
        expect(users[0].firstName).toBe(userData.firstName);
        expect(users[0].lastName).toBe(userData.lastName);
        expect(users[0].email).toBe(userData.email);
    });

    it("should return an id of the created user", async () => {
        // Arrange
        const userData = {
            firstName: "saudjavaid",
            lastName: "K",
            email: "saudjavaid2003@gmail.com",
            password: "terimaki",
        };
        // Act
        const response = await request(app)
            .post("/auth/register")
            .send(userData);

        // Assert
        expect(response.body).toHaveProperty("id");
        const repository = connection.getRepository(User);
        const users = await repository.find();
        expect((response.body as Record<string, string>).id).toBe(
            users[0].id,
        );
    });

    it("should assign a customer role", async () => {
        // Arrange
        const userData = {
            firstName: "saudjavaid",
            lastName: "K",
            email: "saudjavaid2003@gmail.com",
            password: "terimaki",
        };
        // Act
        await request(app).post("/auth/register").send(userData);

        // Assert
        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();
        expect(users[0]).toHaveProperty("role");
        expect(users[0].role).toBe(Roles.CUSTOMER);
    });
    
    it("should store the hashed password in the database", async () => {
        // Arrange
        const userData = {
            firstName: "saudjavaid",
            lastName: "K",
            email: "saudjavaid2003@gmail.com",
            password: "terimaki",
        };
        // Act
        await request(app).post("/auth/register").send(userData);

        // Assert
        const userRepository = connection.getRepository(User);
        const users = await userRepository.find({ select: ["password"] });
        expect(users[0].password).not.toBe(userData.password);
        expect(users[0].password).toHaveLength(60);
        expect(users[0].password).toMatch(/^\$2[a|b]\$\d+\$/);
    });

    it("should return 400 status code if email is already exists", async () => {
        // Arrange
        const userData = {
            firstName: "saudjavaid",
            lastName: "akram",
            email: "saudjavaid2003@gmail.com",
            password: "TERIMAKI",
        };
        const userRepository = connection.getRepository(User);
        await userRepository.save({ ...userData, role: Roles.CUSTOMER });

        // Act
        const response = await request(app)
            .post("/auth/register")
            .send(userData);

        const users = await userRepository.find();
        // Assert
        expect(response.statusCode).toBe(400);
        expect(users).toHaveLength(1);
    });

    describe("Fields are missing", () => {
        it("should return 400 status code if email field is missing", async () => {
            // Arrange
            const userData = {
                firstName: "saud",
                lastName: "javiad",
                email: "",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
         it("should return 400 status code if firstName is missing", async () => {
            // Arrange
            const userData = {
                firstName: "",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if lastName is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Rakesh",
                lastName: "",
                email: "rakesh@mern.space",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if password is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    }); // ✅ Added missing closing bracket for the nested describe block
    
    describe("Fields are not in proper format", () => {
        it("should trim the email field", async () => {
            // Arrange
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: " rakesh@mern.space ",
                password: "password",
            };
            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];
            expect(user.email).toBe("rakesh@mern.space");
        });

     it("should return 400 status code if email is not a valid email", async () => {
            // Arrange
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh_mern.space", // Invalid email
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if password length is less than 8 chars", async () => {
            // Arrange
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "pass", // less than 8 chars
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it("shoud return an array of error messages if email is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.body).toHaveProperty("errors");
            expect(
                (response.body as Record<string, string>).errors.length,
            ).toBeGreaterThan(0);
        });
    });; // ✅ Added missing closing bracket for the "Fields are not in proper format" describe block
}); // ✅ Added missing closing bracket for the main describe blockgit 