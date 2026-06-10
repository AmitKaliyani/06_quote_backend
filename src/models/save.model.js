import mongoose, { mongo, Schema } from "mongoose";

const saveSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quoteId: {
      type: Schema.Types.ObjectId,
      ref: "Quote",
      required: true,
    },
  },
  { timestamps: true }
);

saveSchema.index({ userId: 1, quoteId: 1 }, { unique: true });

const Save = mongoose.model("Save", saveSchema);

export default Save;
