import mongoose, { Schema, Types } from "mongoose";

const quotesSchema = new Schema({
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
      values: ["pending", "approved", "rejected"],
      message: "The status should be pending,rejected or approved",
    },
    default: "pending",
  },

  approvedAt: {
    type: Date,
  },
  tags: {
    type: [String],
    lowercase: true,
    validate: {
      validator: function (tags) {
        return tags.length <= 5;
      },
      message: "Maximum 5 tags allowed",
    },
  },
});


quotesSchema.index({ submittedBy: 1 });
quotesSchema.index({ status: 1 });
quotesSchema.index({ createdAt: -1 });
quotesSchema.index({ status: 1, approvedAt: -1 });

const Quote = mongoose.model("quote", quotesSchema);

export default Quote;
