import express from "express"
// import app from "../app";
import { Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";

const router = express.Router();
const authController = new AuthController();

router.post("/register", (req, res) => {
    authController.register(req, res);
});

export default router;
