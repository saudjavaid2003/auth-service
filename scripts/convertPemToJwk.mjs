import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import rsaPemToJwk from "rsa-pem-to-jwk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const privateKeyPath = path.join(__dirname, "../certs/private.pem");

const privateKey = fs.readFileSync(privateKeyPath);

// convert private PEM → public JWK
const jwk = rsaPemToJwk(privateKey, { use: "sig" }, "public");

console.log(JSON.stringify(jwk, null, 2));
