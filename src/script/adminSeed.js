import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../models/admin.model.js";

dotenv.config({ path: "../../.env" });

// console.log(process.env.MONGO_URI);

await mongoose.connect(process.env.MONGO_URI);

await Admin.create({
  email: "admin@gmail.com",
  password: "admin@123",
});

console.log("Admin created");
process.exit();
