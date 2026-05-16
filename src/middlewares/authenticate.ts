import { expressjwt, GetVerificationKey } from "express-jwt";
import { Request } from "express";
import jwksClient from "jwks-rsa";
import { Config } from "../config";
// expressjwt is the actual middleware it is a function that returns a function, we need to configure it with the secret and algorithms
export default expressjwt({
  secret: jwksClient.expressJwtSecret({
    jwksUri: Config.JWKS_URI!,
    cache: true,// cuz we dont want to fetch the keys for every request, we can cache them for some time
    rateLimit: true,// to prevent DoS attacks, we can limit the number of requests to the JWKS endpoint
  }) as GetVerificationKey,
  algorithms: ["RS256"],
  getToken(req: Request) {
    // First, check for Authorization header
    const authHeader = req.headers.authorization;// in my project tokens are only comming from cookies but this is done for postman 
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