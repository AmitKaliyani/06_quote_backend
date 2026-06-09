import Quote from "../models/quote.model.js";
import Save from "../models/save.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynHandler.js";

export const toggleSave = asyncHandler(async (req, res) => {
  const userId = req.user_id;
  const quoteId = req.params.id;

  const quote = await Quote.findById(quoteId);

  if (!quote) {
    throw new ApiError(404, "Quote not found");
  }

  const existingSave = await Save.find({ userId, quoteId });

  if (existingSave) {
    await Save.deleteOne({ userId, quoteId });
    return res
      .status(200)
      .json(new ApiResponse(200, "Unsaved", { save: false }));
  }

  const save = await Save.create({
    userId,
    quoteId,
  });
  return res.status(201).json(new ApiResponse(201, "Saved", { save: true }));
});
