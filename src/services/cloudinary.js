import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

export const uploadOnCloudinary = async (filePath) => {
  if (!filePath) {
    return null;
  }
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "uploads",
    });

    await fs.unlink(filePath);

    return result.secure_url;
  } catch (error) {
    console.log("Cloudinary Error", error);
    try {
      if (filePath) {
        await fs.unlink(filePath);
      }
    } catch (error) {
      console.log("File delete Error", error);
    }

    return null;
  }
};
