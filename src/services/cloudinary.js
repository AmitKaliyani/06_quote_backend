import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import { env } from "../config/env.js";

cloudinary.config({
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
});

export const uploadOnCloudinary = async (filePath) => {
  if (!filePath) {
    return null;
  }
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "uploads",
    });

    return result;
  } catch (error) {
    console.log("Cloudinary Error", error);
    return null;
  } finally {
    try {
      await fs.unlink(filePath);
      console.log("File Deleted from local");
    } catch (err) {
      console.log("File delete Error", err.message);
    }
  }
};

export const deleteOnCloudinary = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log("Error while deleting file on cloudinary", error);
  }
};
