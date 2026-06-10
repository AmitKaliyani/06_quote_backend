import { env } from "../config/env.js";
import Admin from "../models/admin.model.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new ApiError(401, "Admin not found");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }
    req.admin = admin;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expire token");
  }
};
