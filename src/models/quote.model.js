import mongoose, { Schema, trusted, Types } from "mongoose";

const quotesSchema = new Schema(
  {
    text: {
      type: String,
      maxlength: 500,
      required: [true, "text is required"],
    },
    attributedTo: {
      type: String,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
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
      type: [{ type: String, lowercase: true, trim: true }],
      lowercase: true,
      validate: {
        validator: function (tags) {
          return tags.length <= 5;
        },
        message: "Maximum 5 tags allowed",
      },
    },
  },
  { timestamps: true }
);

quotesSchema.index({ submittedBy: 1 });
quotesSchema.index({ status: 1 });
quotesSchema.index({ createdAt: -1 });
quotesSchema.index({ status: 1, approvedAt: -1 });

const Quote = mongoose.model("quote", quotesSchema);

export default Quote;

export const getQuotes = async ({
  pageNo,
  submittedBy,
  status,
  populate,
  id,
}) => {
  const filterParams = {};
  if (pageNo !== undefined && pageNo !== null) {
    filterParams.pageNo = pageNo;
  }

  if (submittedBy) {
    filterParams.submittedBy = submittedBy;
  }

  if (status) {
    filterParams.status = status;
  }

  if (id) {
    filterParams["_id"] = id;
  }

  if (populate) {
    const quotes = await Quote.find(filterParams).populate(populate);
    return quotes;
  } else {
    const quotes = await Quote.find(filterParams);
    return quotes;
  }
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
