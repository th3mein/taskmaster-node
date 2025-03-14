import path from "path";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config/config";

import { connectDB } from "./config/dbConn";
// import router from "./routes/root";
import { logger, logEvents } from "./middlewares/logger";
import { errorHandler } from "./middlewares/errorHandlers";
import { corsOptions } from "./config/corsOptions";

import router from "./routes";
// import { router as userRoutes } from "./routes/userRoutes";
// import { router as noteRoutes } from "./routes/noteRoutes";

import "express-async-errors";

connectDB();

export const app = express();

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", router());
// app.use("/users", userRoutes);
// app.use("/notes", noteRoutes);

app.all("*", (req: express.Request, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(config.port, () =>
    console.log(`Server running on port ${config.port}`)
  );
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
