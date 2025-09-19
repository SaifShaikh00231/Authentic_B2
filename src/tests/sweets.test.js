const request = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config();

const app = require("../app");
const Sweet = require("../models/Sweet");
const User = require("../models/User");

let token;

jest.setTimeout(60000); // 30 seconds, enough for Atlas connection

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Clear collections
  await User.deleteMany({});
  await Sweet.deleteMany({});

  // Register and login a test user to get JWT
  await request(app).post("/api/auth/register").send({
    username: "sweettester",
    email: "sweettester@example.com",
    password: "password123",
    role: "admin",
  });

  const loginRes = await request(app).post("/api/auth/login").send({
    email: "sweettester@example.com",
    password: "password123",
  });

  token = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.connection.close(true);
});

beforeEach(async () => {
  await Sweet.deleteMany({});
});

describe("Sweets API", () => {
  describe("POST /api/sweets", () => {
    it("should create a new sweet", async () => {
      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Gulab Jamun",
          category: "Indian",
          price: 100,
          quantity: 10,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.name).toBe("Gulab Jamun");
    });

    it("should fail if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe(
        "Name, category, price, and quantity are required"
      );
    });
  });

  describe("GET /api/sweets", () => {
    it("should fetch all sweets", async () => {
      await Sweet.create({
        name: "Ladoo",
        category: "Indian",
        price: 50,
        quantity: 20,
      });

      const res = await request(app)
        .get("/api/sweets")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
  });

  describe("PUT /api/sweets/:id", () => {
    it("should update a sweet", async () => {
      const sweet = await Sweet.create({
        name: "Rasgulla",
        category: "Indian",
        price: 120,
        quantity: 25,
      });

      const res = await request(app)
        .put(`/api/sweets/${sweet._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ price: 150 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.price).toBe(150);
    });

    it("should return 404 if sweet not found", async () => {
      const res = await request(app)
        .put("/api/sweets/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${token}`)
        .send({ price: 150 });

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toBe("Sweet not found");
    });
  });

  describe("DELETE /api/sweets/:id", () => {
    it("should delete a sweet", async () => {
      const sweet = await Sweet.create({
        name: "Peda",
        category: "Indian",
        price: 60,
        quantity: 30,
      });

      const res = await request(app)
        .delete(`/api/sweets/${sweet._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("Sweet deleted successfully");
    });

    it("should return 404 if sweet not found", async () => {
      const res = await request(app)
        .delete("/api/sweets/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toBe("Sweet not found");
    });
  });
});
