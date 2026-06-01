import Like from "../models/like.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynHandler.js";

export const toggleLike = asyncHandler(async (req, res) => {
  const { quoteId } = req.body;
  const userId = req.user?._id;

  const existingLike = await Like.findOne({
    quoteId,
    userId,
  });

  if (existingLike) {
    await Like.deleteOne({ quoteId, userId });
    return res.status(200).json(new ApiResponse(200, "Unliked"));
  }

  await Like.create({ userId, quoteId });
  return res.status(201).json(new ApiResponse(201, "Liked"));
});



