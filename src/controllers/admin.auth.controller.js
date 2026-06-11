import Admin from "../models/admin.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynHandler.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import crypto from "crypto";
import AdminSession from "../models/admin.sessions.model.js";
import * as adminModel from "../models/admin.model.js";
import * as adminSessionModel from "../models/admin.sessions.model.js";

import {
  generateRefreshToken,
  generateHashedToken,
} from "../services/generateRefreshToken.js";
import { removeCookie, setCookie } from "../services/setCookie.js";
import { log } from "console";

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Invalid credentials");
  }

  const admin = await adminModel.getAdmin({ email });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const isPasswordMatch = await admin.comparePassword(password);

  if (!isPasswordMatch) {
    throw new ApiError(400, "Invalid credentials");
  }

  const accessToken = admin.generateAccessToken();

  const refreshToken = generateRefreshToken();
  const hashedToken = generateHashedToken(refreshToken);

  const session = await adminSessionModel.createSession({
    userId: admin._id,
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
    new ApiResponse(200, "Admin loggedIn successfully", {
      id: admin._id,
      email: admin.email,
    })
  );
});

const refresh = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken;

  if (!incomingToken) {
    throw new ApiError(401, "No refresh token found");
  }

  const hashedIncomingToken = generateHashedToken(incomingToken);

  const session = await adminSessionModel.getValidSession(hashedIncomingToken);

  if (!session) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const admin = await adminModel.getAdmin({ userId: session.userId });
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const accessToken = admin.generateAccessToken();
  const newRefreshToken = generateRefreshToken();

  const newHashedRefreshToken = generateHashedToken(newRefreshToken);

  await adminSessionModel.rotateRefreshToken(
    hashedIncomingToken,
    newHashedRefreshToken
  );

  setCookie({
    res,
    name: "refreshToken",
    value: newRefreshToken,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  setCookie({
    res,
    name: "accessToken",
    value: accessToken,
    maxAge: 15 * 60 * 1000,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "New accessToken generated"));
});

const adminLogout = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "No refreshToken found");
  }

  const hashedIncomingToken = crypto
    .createHash("sha256")
    .update(incomingRefreshToken)
    .digest("hex");

  const session = await adminSessionModel.revokeSession(hashedIncomingToken);

  if (!session) {
    throw new ApiError(404, "No session found");
  }

  removeCookie(res, "accessToken");
  removeCookie(res, "refreshToken");

  return res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

const getCurrentAdmin = asyncHandler(async (req, res) => {
  const adminId = req.admin?.id;

  const admin = await Admin.findById({ _id: adminId }).select(
    "-password -name"
  );

  if (!admin) {
    throw new ApiError(404, "Admin not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Admin fetched successfully", admin));
});

export { adminLogin, adminLogout, refresh, getCurrentAdmin };
