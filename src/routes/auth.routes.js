import { Router } from "express";
import controller from "../controllers/user.auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerUserSchema } from "../validators/registerUserSchema.js";
import { loginUserSchema } from "../validators/loginUserSchema.js";
import { authRateLimit } from "../middlewares/ratelimit.middleware.js";

const router = Router();

router.post("/register", validate(registerUserSchema), controller.registerUser);
router.post(
  "/login",
  validate(loginUserSchema),
  authRateLimit,
  controller.loginUser
);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logoutUser);

export default router;
