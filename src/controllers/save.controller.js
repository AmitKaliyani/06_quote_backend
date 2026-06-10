import mongoose from "mongoose";
import Quote from "../models/quote.model.js";
import Save from "../models/save.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynHandler.js";

export const toggleSave = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const quoteId = req.params.id;

  const quote = await Quote.findById(quoteId);

  if (!quote) {
    throw new ApiError(404, "Quote not found");
  }

  const existingSave = await Save.findOne({ userId, quoteId });

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

export const getSavedQuotes = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const savedQUotes = await Save.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },

    {
      $lookup: {
        from: "quotes",
        localField: "quoteId",
        foreignField: "_id",
        as: "quote",
      },
    },
    {
      $unwind: "$quote",
    },
    {
      $replaceRoot: {
        newRoot: "$quote",
      },
    },

    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "quoteId",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "saves",
        localField: "_id",
        foreignField: "quoteId",
        as: "saves",
      },
    },
    {
      $addFields: {
        likeCount: { $size: "$likes" },
        isSaved: true,
        isLiked: {
          $anyElementTrue: {
            $map: {
              input: "$likes",
              as: "l",
              in: { $eq: ["$$l.userId", userId] },
            },
          },
        },
      },
    },
    {
      $project: {
        likes: 0,
        saves: 0,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);

  const total = await Save.countDocuments({
    userId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Saved quote fetched successfully",
      savedQUotes,
      true,
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    )
  );

  console.log(savedQUotes);
});
