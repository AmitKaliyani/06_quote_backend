import { env } from "../config/env.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const userAuthMiddleware = async (req, res, next) => {
  try {
  
    const token = req.cookies.accessToken
 
    if (!token) {
      throw new ApiError(401, "User not found");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expire token");
  }
};
