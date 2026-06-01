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

  return res
    .status(200)
    .json(new ApiResponse(200, "Quote status update successfully", quote));
});

const deleteQuote = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const quote = await quoteModel.deleteQuoteById({ _id: id });

  if (!quote) {
    throw new ApiError(404, "Quote not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Quote deleted successfully"));
});

export default {
  getPendingQuotes,
  approveQuote,
  rejectQuote,
  deleteQuote,
  //   getAllUsers,
};
