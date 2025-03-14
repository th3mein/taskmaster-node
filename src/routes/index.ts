import path from "path";
import express from "express";
import users from "./userRoutes";
import notes from "./noteRoutes";
import auth from "./authRoutes";
const router = express.Router();
router.get("^/$|/index(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

export default (): express.Router => {
  auth(router);
  users(router);
  notes(router);

  return router;
};
