import Quote from "../models/quote.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynHandler.js";

//  public controller

const getQuotes = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const cursor = req.query.cursor;

  let query = {};

  if(req.query.search){
    query.$or = [
      {text:{$regex:req.query.search,$options:"i"}}, 
      {attributedTo:{$regex:req.query.search,$options:"i"}}, 

    ]
  }

  if(req.query.tag){
    query.tags = {$in:req.query.tag}
  }

  if(req.query.author){
    query.attributedTo = {
      $regex:req.query.author,
      $options:"i"
    }
  }

  if (cursor) {
    query.approvedAt = { $lt: new Date(cursor) };
  }

  const quotes = await Quote.find(query)
    .populate({
      path: "submittedBy",
      select: "-password -refreshToken",
    })
    .sort({ approvedAt:-1,_id:-1 })
    .limit(limit);


    const nextCursor = quotes.length === limit ? quotes[quotes.length-1].approvedAt: null

  return res
    .status(200)
    .json(new ApiResponse(200, "Quotes fetched successfully", quotes,true,nextCursor));
});





const getQuoteById = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id).populate({
    path: "submittedBy",
    select: "-password -refreshToken",
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

  const quote = await Quote.create({
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

  const quotes = await Quote.find({ submittedBy: id });
  console.log(quotes);

  return res
    .status(200)
    .json(new ApiResponse(200, "Quotes fetched successfully", quotes));
});

const updateQuoteById = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const quote = await Quote.findOneAndUpdate(
    {
      _id: id,
      submittedBy: req.user._id,
      status: "pending",
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!quote) {
    throw new ApiError(404, "Quote not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Quote updated successfully", quote));
});

const deleteQuoteById = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const quote = await Quote.findOneAndDelete({
    _id: id,
    submittedBy: req.user._id,
    status: "pending",
  });

  if (!quote) {
    throw new ApiError(404, "quote not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Quote deleted successfully"));
});
export default {
  createQuote,
  getMyQuotes,
  getQuotes,
  getQuoteById,
  updateQuoteById,
  deleteQuoteById,
};
