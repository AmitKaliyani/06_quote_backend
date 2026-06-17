import Like from "../models/like.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynHandler.js";
import Quote from "../models/quote.model.js";
import ApiError from "../utils/ApiError.js";

export const toggleLike = asyncHandler(async (req, res) => {
  const quoteId = req.params.id;
  const userId = req.user?._id;

  const quote = await Quote.findById(quoteId);
  if (!quote) throw new ApiError(404, "Quote not found");

  const existingLike = await Like.findOne({
    quoteId,
    userId,
  });

  if (existingLike) {
    await Like.deleteOne({ quoteId, userId });
    return res
      .status(200)
      .json(new ApiResponse(200, "Unliked", { liked: false }));
  }

  await Like.create({ userId, quoteId });
  return res.status(201).json(new ApiResponse(201, "Liked", { liked: true }));
});
