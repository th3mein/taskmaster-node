import { access } from "fs";

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3500"),
  databaseURI: process.env.DATABASE_URI || "",
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
};

export default config;
