import ApiError from "../utils/ApiError.js";

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.user.role;

    if (!role) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (!allowedRoles.includes(role)) {
      throw new ApiError(403, "Access denied");
    }
    next();
  };
};

export default roleMiddleware;
