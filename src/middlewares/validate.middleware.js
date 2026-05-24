import ApiError from "../utils/ApiError.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const formattedError = result.error.issues.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));

    throw new ApiError(400, "Validation failed", formattedError);
  }

  req.body = result.data;
  next();
};
