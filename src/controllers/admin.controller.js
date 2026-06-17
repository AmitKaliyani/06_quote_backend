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
  // console.log(skip);

  const filterParams = {};

  if (status) {
    filterParams.status = status;
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
      $unwind: {
        path: "$submittedBy",
        preserveNullAndEmptyArrays: true,
      },
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

  // console.log("After Match:", quotes.length);
  // console.log("After Match:", quotes);

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

const getMonthlyQuotesStats = asyncHandler(async (req, res) => {
  // console.log(formattedData);

  const monthlyQuotes = await Quote.aggregate([
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          status: "$status",
        },
        quotes: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        "_id.month": 1,
      },
    },

    {
      $project: {
        _id: 0,
        month: "$_id.month",
        status: "$_id.status",
        quotes: 1,
      },
    },
  ]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const formattedData = months.map((month) => ({
    month,
    approved: 0,
    rejected: 0,
    "pending-review": 0,
  }));

  // console.log(formattedData);

  monthlyQuotes.forEach((item) => {
    // console.log(item);

    const monthIndex = item.month - 1;
    formattedData[monthIndex][item.status] = item.quotes;
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Quotes monthly stats fetched successfully",
        formattedData
      )
    );
});

const getTopContributers = asyncHandler(async (req, res) => {
  const topContributer = await Quote.aggregate([
    // stsge 1 grouping
    {
      $group: {
        _id: "$submittedBy",
        totalQuotes: {
          $sum: 1,
        },
      },
    },

    // stage 2 sorting
    {
      $sort: {
        totalQuotes: -1,
      },
    },

    // stage 3 limit 5

    {
      $limit: 5,
    },

    // stage for looking for user

    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },

    // retrive object unwind

    {
      $unwind: "$user",
    },

    {
      $project: {
        name: "$user.name",
        email: "$user.email",
        userId: "$user._id",
        _id: 0,
        totalQuotes: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Top contributers fetched successfully",
        topContributer
      )
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
  getMonthlyQuotesStats,
  getTopContributers,
};
