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
import { removeCookie, setCookie } from "../services/setCookie.js";
import { log } from "console";
import logger from "../config/logger.js";

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
    logger.warn({
      event: "LOGIN_FAILED",
      email,
    });
    throw new ApiError(400, "Invalid credentials");
  }

  const user = await userModel.getUser({ email });

  if (!user) {
    logger.warn({
      event: "LOGIN_FAILED",
      email,
    });
    throw new ApiError(404, "User not found");
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    logger.warn({
      event: "LOGIN_FAILED",
      email,
      ip: req.ip,
    });
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
    name: "userAccessToken",
    value: accessToken,
    maxAge: 15 * 60 * 1000,
  });

  setCookie({
    res,
    name: "userRefreshToken",
    value: refreshToken,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logger.info({
    event: "USER_LOGIN",
    userId: user?._id,
    email: user?.email,
    sessionId: session?._id,
  });

  return res.status(200).json(
    new ApiResponse(200, "User loggedIn successfully", {
      id: user._id,
      email: user.email,
    })
  );
});

const refresh = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.userRefreshToken;
  // console.log("Cookie Token", incomingToken);

  if (!incomingToken) {
    throw new ApiError(401, "No refresh token found");
  }

  const hashedIncomingToken = generateHashedToken(incomingToken);
  // console.log("HashedIncoming TOken", hashedIncomingToken);

  const session = await userSessionModel.getValidSession(hashedIncomingToken);

  // console.log("Session", !!session);

  if (!session) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await userModel.getUser({ userId: session.userId });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const accessToken = user.generateAccessToken();
  // console.log("AccessToken : ", accessToken);
  const newRefreshToken = generateRefreshToken();

  const newHashedRefreshToken = generateHashedToken(newRefreshToken);

  await userSessionModel.rotateRefreshToken(
    hashedIncomingToken,
    newHashedRefreshToken
  );

  setCookie({
    res,
    name: "userRefreshToken",
    value: newRefreshToken,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  setCookie({
    res,
    name: "userAccessToken",
    value: accessToken,
    maxAge: 15 * 60 * 1000,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "New accessToken generated"));
});

const logoutUser = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.userRefreshToken;
  console.log(req.user);

  if (!incomingRefreshToken) {
    throw new ApiError(400, "No refreshToken found");
  }

  const hashedIncomingToken = generateHashedToken(incomingRefreshToken);

  const session = await userSessionModel.revokeSession(hashedIncomingToken);

  if (!session) {
    throw new ApiError(404, "No session found");
  }

  removeCookie(res, "userAccessToken");
  removeCookie(res, "userRefreshToken");

  logger.info({
    event: "USER_LOGOUT",
    userId: req?.user?.id,
    email: req?.user?.email,
    sessionId: session?._id,
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
