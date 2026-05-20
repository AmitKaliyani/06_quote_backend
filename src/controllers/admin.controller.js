import User from "../models/user.model.js";
import Quote from "../models/quote.model.js";
import asyncHandler from "../utils/asynHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const getPendingQuotes = asyncHandler(async (req, res) => {
  const quotes = await Quote.find({ status: "pending" });

  return res
    .status(200)
    .json(new ApiResponse(200, "Pending quotes fetched successfully", quotes));
});

const approveQuote = asyncHandler(async (req, res) => {
  const id = req.params.id;
  // const {} = req.body

  const quote = await Quote.findById(id);

  if (!quote) {
    throw new ApiError(404, "Quote not found");
  }

  quote.status = "approved";
  quote.approvedAt = Date.now();

  await quote.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Quote status update successfully", quote));
});

const rejectQuote = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const quote = await Quote.findById(id);

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

  const quote = await Quote.findByIdAndDelete(id);

  if (!quote) {
    throw new ApiError(404, "Quote not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Quote deleted successfully"));
});

// const getAllUsers = asyncHandler(async (req, res) => {});

export default {
  getPendingQuotes,
  approveQuote,
  rejectQuote,
  deleteQuote,
//   getAllUsers,
};
