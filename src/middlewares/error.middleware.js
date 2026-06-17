import logger from "../config/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
  });

  return res.status(err.statusCode || 500).json({
    statusCode: err.statusCode || 500,
    success: false,
    message: err.message || "Internal Server error",
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorHandler;
