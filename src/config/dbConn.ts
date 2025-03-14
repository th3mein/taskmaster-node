import mongoose from "mongoose";
import config from "./config";

export async function connectDB() {
  try {
    await mongoose.connect(config.databaseURI);
  } catch (err) {
    console.log(err);
  }
}
