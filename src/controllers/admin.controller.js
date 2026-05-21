import User from "../models/user.model.js";
import Quote, { getQuotes } from "../models/quote.model.js";
import asyncHandler from "../utils/asynHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import * as quoteModel from "../models/quote.model.js";

const getPendingQuotes = asyncHandler(async (req, res) => {
  // const quotes = await getQuotes({ status: "pending-review" });
  const quotes = await quoteModel.getQuotes({ status: "pending-review" });
  return res
    .status(200)
    .json(new ApiResponse(200, "Pending quotes fetched successfully", quotes));
});

const approveQuote = asyncHandler(async (req, res) => {
  const id = req.params.id;
  // const {} = req.body

  const quote = await quoteModel.updateQuoteById({
    filter: { _id: req.params.id },
    updateData: { status: "approved", approvedAt: Date.now() },
  });

  if (!quote) {
    throw new ApiError(404, "Quote not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Quote status update successfully", quote));
});

const rejectQuote = asyncHandler(async (req, res) => {

  const quote = await quoteModel.updateQuoteById({
    filter: { _id: req.params.id },
    updateData: { status: "rejected", rejectedAt: Date.now() },
  });

  if (!quote) {
    throw new ApiError(404, "Quote not found");
  }

  quote.status = "rejected";
  quote.approvedAt = Date.now();

  await quote.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Quote status update successfully", quote));
});

const deleteQuote = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const quote = await quoteModel.deleteQuoteById({_id:id});

  if (!quote) {
    throw new ApiError(404, "Quote not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Quote deleted successfully"));
});

// const getAllUsers = asyncHandler(async (req, res) => {});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Both fields are required");
  }

  const admin = await User.findOne({ email });

  if (!admin) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordMatch = await bcrypt.compare(password, admin.password);

  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (admin.role !== "admin") {
    throw new ApiError(403, "Access denied:Not admin");
  }

  const accessToken = jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

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
      email: admin.email,
      role: admin.role,
    })
  );
});

export default {
  getPendingQuotes,
  approveQuote,
  rejectQuote,
  deleteQuote,
  adminLogin,
  //   getAllUsers,
};
