import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynHandler.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import crypto from "crypto";
import UserSession from "../models/user.sessions.model.js";
import * as userModel from "../models/user.model.js";
import * as userSessionModel from "../models/user.sessions.model.js";
import {
  generateRefreshToken,
  generateHashedToken,
} from "../services/generateRefreshToken.js";
import { setCookie } from "../services/setCookie.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await userModel.getUser({ email });

  if (user) {
    throw new ApiError(409, "User already exists");
  }

  const createdUser = await userModel.createUser({
    name,
    email,
    password,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Invalid credentials");
  }

  const user = await userModel.getUser({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new ApiError(400, "Invalid credentials");
  }

  const accessToken = user.generateAccessToken();

  const refreshToken = generateRefreshToken();
  const hashedToken = generateHashedToken(refreshToken);

  const session = await userSessionModel.createSession({
    userId: user._id,
    refreshToken: hashedToken,
    ip: req.headers["x-forwarded-for"] || req.ip,
    deviceInfo: req.headers["user-agent"],
    isActive: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  setCookie({
    res,
    name: "accessToken",
    value: accessToken,
    maxAge: 15 * 60 * 1000,
  });

  setCookie({
    res,
    name: "refreshToken",
    value: refreshToken,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(
    new ApiResponse(200, "User loggedIn successfully", {
      id: user._id,
      email: user.email,
    })
  );
});

const refresh = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken;

  if (!incomingToken) {
    throw new ApiError(401, "No refresh token");
  }

  const hashedIncomingToken = generateHashedToken(incomingToken);

  const session = await userSessionModel.getValidSession(hashedIncomingToken);

  if (!session) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await userModel.getUser({userId:session.userId});

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const token = user.generateAccessToken();

  const newRefreshToken = generateRefreshToken();

  const newHashedRefreshToken = generateHashedToken(newRefreshToken);

  session.refreshToken = newHashedRefreshToken;
  session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await session.save();

  setCookie({res,name:"refreshToken", value:newRefreshToken, maxAge: 7 * 24 * 60 * 60 * 1000,});

  return res
    .status(200)
    .json(new ApiResponse(200, "New accessToken generated", token));
});

const logoutUser = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "No refreshToken found");
  }

  const hashedIncomingToken = crypto
    .createHash("sha256")
    .update(incomingRefreshToken)
    .digest("hex");

  const session = await userSessionModel.getSession({
    refreshToken: hashedIncomingToken,
    isActive: true,
  });

  if (!session) {
    throw new ApiError(404, "No session found");
  }

  session.isActive = false;
  await session.save();

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });

  return res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

const controller = {
  registerUser,
  loginUser,
  logoutUser,
  refresh,
};

export default controller;
