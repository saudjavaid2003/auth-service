import { config } from "dotenv";
import path from "path";

// Simple and compatible approach
const envPath = path.join(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`);

config({ path: envPath });

const { PORT, NODE_ENV, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, REFRESH_TOKEN_SECRET } = process.env;

export const Config = {
    NODE_ENV,
    PORT,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    REFRESH_TOKEN_SECRET
};