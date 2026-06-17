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
    { id: this._id, email: this.email },
    env.ADMIN_JWT_SECRET,
    { expiresIn: "15m" }
  );
};


adminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};


// adminSchema.methods.generateRefreshToken = function () {
//   return jwt.sign({ id: this._id }, env.JWT_REFRESH_SECRET, {
//     expiresIn: "7d",
//   });
// };



const Admin = mongoose.model("Admin", adminSchema);

export default Admin;

export const getAdmin = async ({email,userId}) => {
  if (!email && !userId) return null;
  let filter = {}

  if(email){
    filter.email = email
  }
  if(userId){
     filter['_id'] = userId;
  }
  return await Admin.findOne(filter);
};