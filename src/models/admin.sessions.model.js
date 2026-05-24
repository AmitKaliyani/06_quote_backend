import mongoose, { Schema } from "mongoose";

const adminSessionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
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

const AdminSession = mongoose.model("AdminSession",adminSessionSchema);
export default AdminSession;

export const getValidSession = async (token) => {
  const session = await AdminSession.findOne({
    refreshToken: token,
    expiresAt: { $gt: new Date() },
    isActive: true,
  });
  return session;
};

export const rotateRefreshToken = async (oldToken, newToken) => {
  await AdminSession.findOneAndUpdate(
    {
      refreshToken: oldToken,
      isActive: true,
    },
    {
      refreshToken: newToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

export const revokeSession = async (token) => {
  return await AdminSession.findOneAndUpdate(
    { refreshToken: token, isActive: true, expiresAt: { $gt: new Date() } },
    { isActive: false },
    { new: true, runValidators: true }
  );
};

export const createSession = async (sessionData) => {
  return await AdminSession.create(sessionData);
};
