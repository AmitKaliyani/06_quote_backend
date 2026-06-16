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

  // console.log(session);

  return session;
};

export const rotateRefreshToken = async (oldToken, newToken) => {
  await UserSession.findOneAndUpdate(
    {
      refreshToken: oldToken,
      isActive: true,
    },
    {
      refreshToken: newToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );
};

export const revokeSession = async (token) => {
  return await UserSession.findOneAndUpdate(
    { refreshToken: token, isActive: true, expiresAt: { $gt: new Date() } },
    { isActive: false },
    { returnDocument: "after", runValidators: true }
  );
};

export const createSession = async (sessionData) => {
  return await UserSession.create(sessionData);
};
