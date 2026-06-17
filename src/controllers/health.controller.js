import mongoose, { mongo } from "mongoose";
import asyncHandler from "../utils/asynHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const healthCheck = asyncHandler(async (req, res) => {
  const memory = process.memoryUsage();

  const healthData = {
    status: "UP",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,

    database: {
      status:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    },

    memory: {
      rss: memory.rss,
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, "Health fetched successfully", healthData));
});

const livenessCheck = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, "Application is alive", {
      status: "alive",
      timestamp: new Date().toISOString(),
    })
  );
});

const readinessCheck = asyncHandler(async (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;

  if (!mongoConnected) {
    throw new ApiError(
      503,
      "Apllication is not ready. Database connection unavailable"
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Application is ready", {
      status: "ready",
      timestamp: new Date().toISOString(),
      checks: { database: "connected" },
    })
  );
});

export default {
  healthCheck,
  livenessCheck,
  readinessCheck,
};
