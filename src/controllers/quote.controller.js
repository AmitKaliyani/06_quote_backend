import Quote from "../models/quote.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynHandler.js";
import * as quotesModel from "../models/quote.model.js";

//  public controller

const getQuotes = asyncHandler(async (req, res) => {
  const {
    page = req.query.page,
    limit = req.query.limit,
    search = req.query.search,
    sort = req.query.sort,
  } = req.query;

  // console.log(req.query.search);

  const quotes = await quotesModel.getQuotes({
    status: "approved",
    populate: {
      path: "submittedBy",
      select: "-password -refreshToken",
    },
    page,
    limit,
    search,
    sort,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Quotes fetched successfully", quotes, true));
});

const getQuoteById = asyncHandler(async (req, res) => {
  const quote = await quotesModel.getQuoteById({
    id: req.params.id,
    populate: { path: "submittedBy", select: "-password -refreshToken" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Quote fetched successfully", quote));
});

//  users controller

const createQuote = asyncHandler(async (req, res) => {
  const { text, attributedTo, tags } = req.body;

  if (!text || text.trim() === "") {
    throw new ApiError(400, "Text is required");
  }

  if (tags && tags.length > 5) {
    throw new ApiError(400, "Maximum 5 tags allowed");
  }

  const quote = await quotesModel.createQuote({
    text,
    attributedTo,
    tags,
    submittedBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Quote created successfully", quote));
});

const getMyQuotes = asyncHandler(async (req, res) => {
  const id = req.user._id;

  const { quotes, pagination } = await quotesModel.getQuotes({
    submittedBy: id,
  });
  // console.log("GET MY QUOTES : ",quotes,pagination);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Quotes fetched successfully", quotes, true, {
        ...pagination,
      })
    );
});

const updateQuoteById = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const quote = await quotesModel.updateQuoteById({
    filter: {
      _id: id,
      submittedBy: req.user._id,
      status: "pending-review",
    },
    updateData: { ...req.body },
  });

  if (!quote) {
    throw new ApiError(404, "Quote not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Quote updated successfully", quote));
});

const deleteQuoteById = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const quote = await quotesModel.deleteQuoteById({
    _id: id,
    submittedBy: req.user._id,
    status: "pending-review",
  });

  if (!quote) {
    throw new ApiError(404, "quote not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Quote deleted successfully"));
});

export const getTrendingQuote = asyncHandler(async (req, res) => {
  const quotes = await Quote.aggregate([
    {
      $match:{
        status:"approved"
      }
    }
    ,
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
      $project: {
        likes: 0,
      },
    },

    {
   $sort:{likeCount:-1}
    },
    {
      $limit:3
    }
  ]);

  return res.status(200).json(new ApiResponse(200,"Trending quotes fetched successfully",quotes))
});

export default {
  createQuote,
  getMyQuotes,
  getQuotes,
  getQuoteById,
  updateQuoteById,
  deleteQuoteById,
  getTrendingQuote,
};
