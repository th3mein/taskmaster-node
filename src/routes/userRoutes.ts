import express from "express";
import {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import verifyJWT from "../middlewares/verifyJWT";

export default (router: express.Router) => {
  // router.use(verifyJWT);
  router
    .get("/users", verifyJWT, getAllUsers)
    .post("/users", verifyJWT, createNewUser)
    .patch("/users", verifyJWT, updateUser)
    .delete("/users", verifyJWT, deleteUser);
};
