import crypto from "crypto";
export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

export const generateHashedToken = (refreshToken) => {
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
};
