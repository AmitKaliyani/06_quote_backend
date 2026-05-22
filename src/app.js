import express from "express";
import authRouter from "./routes/auth.routes.js";
import quoteRouter from "./routes/quote.routes.js";
import adminRouter from "./routes/admin.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/quotes", quoteRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);

export default app;
