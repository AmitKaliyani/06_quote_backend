import mongoose, { Schema, trusted, Types } from "mongoose";
import ApiError from "../utils/ApiError.js";

const quotesSchema = new Schema(
  {
    text: {
      type: String,
      maxlength: 500,
      required: [true, "text is required"],
    },
    author: {
      type: String,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: {
        values: ["pending-review", "approved", "rejected"],
        message:
          "The status should be either pending-review,rejected or approved",
      },
      default: "pending-review",
    },

    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    tags: {
      type: [
        {
          type: String,
          lowercase: true,
          trim: true,
          enum: {
            values: [
              "motivation",
              "love",
              "life",
              "wealth",
              "success",
              "business",
              "friendship",
              "leadership",
            ],
            message: "Invalid Tags",
          },
        },
      ],
      lowercase: true,
      validate: {
        validator: function (tags) {
          return tags.length <= 3;
        },
        message: "Maximum 3 tags allowed",
      },
    },
  },
  { timestamps: true }
);

quotesSchema.index({ submittedBy: 1 });
quotesSchema.index({ status: 1 });
quotesSchema.index({ createdAt: -1 });
quotesSchema.index({ status: 1, approvedAt: -1 });

const Quote = mongoose.model("Quote", quotesSchema);

export default Quote;

export const getQuotes = async ({
  submittedBy,
  page = 1,
  limit = 10,
  search = "",
  sort = "-createdAt",
  status,
  id,
  populate,
  tags,
}) => {
  // console.log({page,limit,search,sort,status,});

  const skip = (page - 1) * limit;

  const filterParams = {};

  if (submittedBy) {
    filterParams.submittedBy = submittedBy;
  }

  if (status) {
    filterParams.status = status;
  }
  if (tags) {
    filterParams.tags = tags;
  }

  if (id) {
    filterParams["_id"] = id;
  }

  if (search) {
    filterParams.text = {
      $regex: search,
      $options: "i",
    };
  }

  // console.log(filterParams);

  // const pipeline = Quote.aggregate([
  //   {
  //     $lookup: {
  //       from: "likes",
  //       localField: "_id",
  //       foreignField: "quoteId",
  //       as: "likes",
  //     },
  //   },
  //   {
  //     $addFields: {
  //       likeCount: { $size: "$likes" },
  //     },
  //   },
  //   {
  //     $project: {
  //       likes: 0,
  //     },
  //   },
  // ]);

  // let query = Quote.find(filterParams)

  //   .sort(sort)
  //   .skip(skip)
  //   .limit(limit);

  // if (populate) {
  //   query = query.populate(populate);
  // }
  // const quotes = await query;

  const quotes = await Quote.aggregate([
    { $match: filterParams },

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
      $sort: {
        createdAt: -1,
      },
    },

    { $skip: skip },
    { $limit: Number(limit) },
  ]);

  // console.log("Inside Model : ",quotes,filterParams)
  const total = await Quote.countDocuments(filterParams);
  return {
    quotes,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getQuoteById = async ({ id, populate }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Id");
  }

  let query = Quote.findById(id);

  if (populate) {
    query = query.populate(populate);
  }

  const quote = await query;

  return quote;
};

export const createQuote = async (qouteData) => {
  const quote = await Quote.create(qouteData);
  return quote;
};

export const updateQuoteById = async ({ filter, updateData }) => {
  const quote = await Quote.findByIdAndUpdate(filter, updateData, {
    new: true,
    runValidators: true,
  });
  return quote;
};

export const deleteQuoteById = async (filter) => {
  const quote = await Quote.findByIdAndDelete(filter);

  return quote;
};
