import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 8000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  ALLOW_ORIGIN: process.env.ALLOW_ORIGIN,
  NODE_ENV: process.env.NODE_ENV,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  CLIENT_URL: process.env.CLIENT_URL,
};
