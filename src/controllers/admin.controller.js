import User from "../models/user.model.js";
import Quote, { getQuotes } from "../models/quote.model.js";
import asyncHandler from "../utils/asynHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import * as quoteModel from "../models/quote.model.js";
import Like from "../models/like.model.js";

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

const getDashBoardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalQuotes,
    pendingQuotes,
    approvedQuotes,
    rejectedQuotes,
    totalLikes,
  ] = await Promise.all([
    User.countDocuments(),
    Quote.countDocuments(),
    Quote.countDocuments({ status: "pending-review" }),
    Quote.countDocuments({ status: "approved" }),
    Quote.countDocuments({ status: "rejected" }),
    Like.countDocuments(),
  ]);

  return res.status(200).json(
    new ApiResponse(200, "DashBoard stats fetched successfully", {
      totalUsers,
      totalQuotes,
      pendingQuotes,
      approvedQuotes,
      rejectedQuotes,
      totalLikes,
    })
  );
});

const getAllQuotes = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const filterParams = {};

  if (status) {
    filter.status = status;
  }

  const quotes = await Quote.aggregate([
    {
      $match: filterParams,
    },

    {
      $lookup: {
        from: "users",
        localField: "submittedBy",
        foreignField: "_id",
        as: "submittedBy",
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
      $addFields: {
        likeCount: { $size: "$likes" },
      },
    },
    {
      $unwind: "$submittedBy",
    },
    {
      $project: {
        "submittedBy.password": 0,
        "submittedBy.createdAt": 0,
        "submittedBy.updatedAt": 0,
        "submittedBy.__v": 0,
        likes: 0,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    { $skip: skip },
    { $limit: Number(limit) },
  ]);

  const total = await Quote.countDocuments(filterParams);
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json(
    new ApiResponse(200, "Quote fetched successfully", quotes, true, {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
    })
  );
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const users = await User.aggregate([
    {
      $lookup: {
        from: "quotes",
        localField: "_id",
        foreignField: "submittedBy",
        as: "quotes",
      },
    },

    {
      $addFields: {
        totalQuotes: {
          $size: "$quotes",
        },

        approvedQuotes: {
          $size: {
            $filter: {
              input: "$quotes",
              as: "quote",
              cond: {
                $eq: ["$$quote.status", "approved"],
              },
            },
          },
        },

        pendingQuotes: {
          $size: {
            $filter: {
              input: "$quotes",
              as: "quote",
              cond: {
                $eq: ["$$quote.status", "pending-review"],
              },
            },
          },
        },

        rejectedQuotes: {
          $size: {
            $filter: {
              input: "$quotes",
              as: "quote",
              cond: {
                $eq: ["$$quote.status", "rejected"],
              },
            },
          },
        },
      },
    },

    {
      $project: {
        password: 0,
        quotes: 0,
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
      $limit: Number(limit),
    },
  ]);

  const total = await User.countDocuments();
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json(
    new ApiResponse(200, "Users fetched successfully", users, true, {
      totalPages,
      total,
      page: Number(page),
      limit: Number(limit),
    })
  );
});

export default {
  getPendingQuotes,
  approveQuote,
  rejectQuote,
  deleteQuote,
  getDashBoardStats,
  getAllUsers,
  getAllQuotes,
};
