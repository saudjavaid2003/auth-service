import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
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
});
