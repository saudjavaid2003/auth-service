import { expressjwt, GetVerificationKey } from "express-jwt";
import { Request } from "express";
import jwksClient from "jwks-rsa";
import { Config } from "../config";

export default expressjwt({
  secret: jwksClient.expressJwtSecret({
    jwksUri: Config.JWKS_URI!,
    cache: true,
    rateLimit: true,
  }) as GetVerificationKey,
  algorithms: ["RS256"],
  getToken(req: Request) {
    // First, check for Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.split(" ")[1] !== "undefined") {
      const tokenFromHeader = authHeader.split(" ")[1];
      console.log("Token from Authorization header:", tokenFromHeader);
      return tokenFromHeader;
    }

    // Then, check cookies
    const tokenFromCookie = req.cookies?.accessToken; // exact case-sensitive name
    console.log("Cookies:", req.cookies);
    console.log("Token from cookie:", tokenFromCookie);

    return tokenFromCookie; // will return undefined if cookie is missing
  },
});
