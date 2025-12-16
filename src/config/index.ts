import { config } from "dotenv";
import path from "path";

const envPath = path.join(__dirname, "../../.env.dev");
console.log("Loading from:", envPath);

config({ path: envPath });

const { PORT, NODE_ENV, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, REFRESH_TOKEN_SECRET, JWKS_URI } = process.env;

console.log("DB_PASSWORD loaded:", DB_PASSWORD ? "YES" : "NO");

export const Config = {
    NODE_ENV,
    PORT,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
};