import express from "express";
import authRouter from "./routes/auth.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/auth", authRouter);

app.use(errorHandler) 

export default app;
