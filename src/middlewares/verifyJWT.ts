import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import config from "../config/config";

declare module "express-serve-static-core" {
  interface Request {
    user?: string; // or specify a more specific type if known
    roles?: string[]; // add roles property to the Request interface
  }
}
const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = (req.headers.authorization ||
    req.headers.Authorization) as string;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, config.accessTokenSecret!, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    req.user = (decoded as JwtPayload).UserInfo.username;
    req.roles = (decoded as JwtPayload).UserInfo.roles;
    next();
  });
};

export default verifyJWT;
