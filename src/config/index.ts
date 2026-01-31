import { config } from "dotenv";
import path from "path";

const NODE_ENV = process.env.NODE_ENV || "dev";

// Direct mapping (simple & explicit – teacher style)
const envPath = path.resolve(
  __dirname,
  "../../.env." + NODE_ENV
);

console.log("Loading env from:", envPath);

config({ path: envPath });
/// yahan per fixing ha ek yad rukahian wo private key wali ha jo k ab hum .env file sy le rahay hn
const {
  PORT,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
  
  
} = process.env;

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
