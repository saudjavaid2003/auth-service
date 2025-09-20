import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { truncateTables } from "../utils";
import { before } from "node:test";
import { User } from "../../src/entity/User";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await truncateTables(connection);
  });

  afterAll(async () => {
    await connection.destroy();
  });

  it("should return 201 when all fields are present", async () => {
    const userdata = {
      firstname: "saudjavaid",
      lastname: "akram",
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
      firstname: "saudjavaid",
      lastname: "akram",
      email: "saudjavaid2003@gmail.com",
      password: "terimaki",
    };

    const response = await request(app)
      .post("/auth/register")
      .send(userdata);

    expect(response.body).toEqual({ message: "User registered successfully" });
  });

  it("should persist the user in the database", async () => {
    // Arrange
    const userData = {
      firstName: "Rakesh",
      lastName: "K",
      email: "rakesh@mern.space",
      password: "password",
    };

    // Act
    await request(app).post("/auth/register").send(userData);

    // Assert
    const userRepository = connection.getRepository(User);
    const users = await userRepository.find();
    expect(users).toHaveLength(1);
    // expect(users[0].firstName).toBe(userData.firstName);
    // expect(users[0].lastName).toBe(userData.lastName);
    // expect(users[0].email).toBe(userData.email);
  });
});