import express from "express";
import authRouter from "./routes/auth.routes.js";
import quoteRouter from "./routes/quote.routes.js";
import adminRouter from "./routes/admin.routes.js";
import healthRouter from "./routes/health.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import metricsRouter from "./routes/metrics.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./config/env.js";
import { adminAuthMiddleware } from "./middlewares/admin.auth.middleware.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import { metricsMiddleware } from "./middlewares/metrics.middleware.js";
import helmet from "helmet";

const app = express();

app.use(
  cors({
    origin: env.ALLOW_ORIGIN.split(",").map((origin) => origin.trim()),
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(requestLogger);
app.use(metricsMiddleware);

app.use("/api/auth", authRouter);
app.use("/api/quotes", quoteRouter);
app.use("/api/admin", adminRouter);
app.use("/api/health", healthRouter);
app.use("/metrics", metricsRouter);

app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl.split("?")[0]} not found`);
  error.statusCode = 404;

  next(error);
});

app.use(errorHandler);

export default app;
