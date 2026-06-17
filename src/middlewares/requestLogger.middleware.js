import logger from "../config/logger.js";

export const requestLogger = (req, res, next) => {
  //   logger.info("Incoming request", {
  //     method: req.method,
  //     url: req.originalUrl,
  //     ip: req.ip,
  //   });

  const start = Date.now();

  res.on("finish", () =>
    logger.info("Request Completed", {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      statusCode: res.statusCode,
      responseTime: `${Date.now() - start}ms`,
    })
  );

  next();
};
