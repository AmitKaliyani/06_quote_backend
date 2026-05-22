import mongoose, { Schema } from "mongoose";

const userSessionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    ip: {
      type: String,
    },
    deviceInfo: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const UserSession = mongoose.model("UserSession", userSessionSchema);
export default UserSession;

export const getValidSession = async (token) => {
  const session = await UserSession.findOne({
    refreshToken: token,
    expiresAt: { $gt: new Date() },
    isActive: true,
  });
  return session;
};

export const createSession = async (sessionData) => {
  return await UserSession.create(sessionData);
};
