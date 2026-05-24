import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "user name is required"],
      trim: true,
    },
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
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ id: this._id, email: this.email }, env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;

export const getUser = async ({email,userId}) => {
  if (!email && !userId) return null;
  let filter = {}

  if(email){
    filter.email = email
  }
  if(userId){
     filter['_id'] = userId;
  }
  return await User.findOne(filter);
};


export const createUser = async(userData) => {
  const user =  await User.create(userData)
  user.password = undefined;

  return user
}