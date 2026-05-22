import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynHandler.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import Admin from "../models/admin.model.js";

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Invalid credentials");
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const isPasswordMatch = await bcrypt.compare(password, admin.password);

  if (!isPasswordMatch) {
    throw new ApiError(400, "Invalid credentials");
  }

  const accessToken = admin.generateAccessToken();

  const refreshToken = admin.generateRefreshToken();

  admin.refreshToken = refreshToken;

  await admin.save();

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(
    new ApiResponse(200, "Admin loggedIn successfully", {
      id: admin._id,
    })
  );
});


const refresh = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken;

  if (!incomingToken) {
    throw new ApiError(401, "No refresh token");
  }

  const decoded = jwt.verify(incomingToken, env.JWT_REFRESH_SECRET);

  const admin = await Admin.findById(decoded.id);

  if (!admin || admin.refreshToken !== incomingToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const newAccessToken = jwt.sign(
    { id: admin._id},
    env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: true,
    maxAge: 15 * 60 * 1000,
  });

  return res.status(200).json(new ApiResponse(200, "Access token refreshed"));
});


const logoutAdmin = asyncHandler(async (req, res) => {
  const id = req.admin._id;

  await Admin.findByIdAndUpdate(id, {
    $unset: { refreshToken: 1 },
  });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "Admin logged out successfully"));
});

const controller = {

  loginAdmin,
  logoutAdmin,
  refresh,
};

export default controller;
