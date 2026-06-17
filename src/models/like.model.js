import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
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
});

likeSchema.index({ userId: 1, quoteId: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);

export default Like;
