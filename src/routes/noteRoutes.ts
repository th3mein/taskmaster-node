import express from "express";
// const router = express.Router();
import {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController";

import verifyJWT from "../middlewares/verifyJWT";

export default (router: express.Router) => {
  // router.use(verifyJWT);
  router
    .get("/notes", verifyJWT, getAllNotes)
    .post("/notes", verifyJWT, createNewNote)
    .patch("/notes", verifyJWT, updateNote)
    .delete("/notes", verifyJWT, deleteNote);
};
