import { Request, Response } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";

import User from "../models/User";
import config from "../config/config";
import { Interface } from "readline";
import { decode } from "punycode";

// @desc Login
// @route POST /auth
// @access Public
const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "All fields are required" });
    return Promise.resolve();
  }

  const foundUser = await User.findOne({ username }).exec();

  if (!foundUser || !foundUser.active) {
    res.status(401).json({ message: "User not found." });
    return;
  }

  const match = await foundUser.comparePassword(password);

  if (!match) {
    res.status(401).json({ message: "Username/Password do not match." });
    return;
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    config.accessTokenSecret!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { username: foundUser.username },
    config.refreshTokenSecret!,
    { expiresIn: "7d" }
  );

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "none", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  // Send accessToken containing username and roles
  res.json({ accessToken });
};

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    config.refreshTokenSecret!,
    async (err: VerifyErrors | null, decoded: unknown) => {
      if (err) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      const foundUser = await User.findOne({
        username: (decoded as JwtPayload).username,
      }).exec();

      if (!foundUser) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        config.accessTokenSecret!,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    }
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    res.sendStatus(204); //No content
    return;
  }
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  res.json({ message: "Cookie cleared" });
};

export { login, refresh, logout };
