import { config } from "dotenv";
import path from "path";

const NODE_ENV = process.env.NODE_ENV || "dev";

// ✅ Only load dotenv locally
if (!process.env.DB_HOST) {
  const envPath = path.join(
    __dirname,
    `../../.env.${NODE_ENV}`
  );

  console.log("Loading env from:", envPath);
  config({ path: envPath });
} else {
  console.log("Using environment variables from process.env");
}

export const Config = {
  PORT: process.env.PORT,
  NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  JWKS_URI: process.env.JWKS_URI,
};
