import express from "express";
import { loginLimiter } from "../middlewares/loginLimiter";
import { login, refresh, logout } from "../controllers/authController";

export default (router: express.Router) => {
  router.post("/auth", loginLimiter, login);
  router.get("/auth/refresh", refresh);
  router.post("/auth/logout", logout);
};
