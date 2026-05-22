import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

adminSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

const Admin = mongoose.model("admin", adminSchema);

export default Admin;
