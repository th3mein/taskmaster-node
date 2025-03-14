import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../src/server";

describe("user", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });
  describe("get user route", () => {
    describe("the user does not exist", () => {
      it("should return a 404", async () => {
        const nonExistentUserId = "abc123";
        const response = await supertest(app).get(`/user/${nonExistentUserId}`);
        expect(response.status).toBe(404);
      });
    });
  });
});
