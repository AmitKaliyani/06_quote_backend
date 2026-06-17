import mongoose from "mongoose";
import { env } from "./env.js";
import logger from "./logger.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    // console.log("MongoDB Connected");
    logger.info("MongoDB Connected");
  } catch (error) {
    console.log(error);
    logger.error(error);
    process.exit(1);
  }
};
