import { Router } from "express";
import controller from "../controllers/user.auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerUserSchema } from "../validators/registerUserSchema.js";
import { loginUserSchema } from "../validators/loginUserSchema.js";
import { authRateLimit } from "../middlewares/ratelimit.middleware.js";
import { userAuthMiddleware } from "../middlewares/user.auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

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

router.get("/my-profile", userAuthMiddleware, controller.myProfile);
router.patch(
  "/avatar",
  upload.single("avatar"),
  userAuthMiddleware,
  controller.uploadProfile
);
router.patch("/update-profile", userAuthMiddleware, controller.updateProfile);

router.post("/forgot-password", controller.forgetPassword);
router.patch(
  "/reset-password/:token",

  controller.resetPassword
);

router.delete("/avatar", userAuthMiddleware, controller.deleteProfile);

export default router;
