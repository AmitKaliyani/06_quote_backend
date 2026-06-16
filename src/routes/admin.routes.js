import { Router } from "express";
import controller from "../controllers/admin.controller.js";
import * as adminAuthController from "../controllers/admin.auth.controller.js";
import { adminAuthMiddleware } from "../middlewares/admin.auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginUserSchema } from "../validators/loginAdminSchema.js";

const router = Router();

router.post(
  "/login",
  validate(loginUserSchema),
  adminAuthController.adminLogin
);
router.post("/logout", adminAuthMiddleware, adminAuthController.adminLogout);
router.get("/me", adminAuthMiddleware, adminAuthController.getCurrentAdmin);
router.post("/refresh", adminAuthController.refresh);

router.get("/pending-quotes", adminAuthMiddleware, controller.getPendingQuotes);
router.get("/dashboard-stats", adminAuthMiddleware, controller.getDashBoardStats);
router.get("/all-quotes", adminAuthMiddleware, controller.getAllQuotes);
router.get("/users", adminAuthMiddleware, controller.getAllUsers);
router.get("/monthly-quotes-stats", adminAuthMiddleware, controller.getMonthlyQuotesStats);
router.get("/top-contributers", adminAuthMiddleware, controller.getTopContributers);
router.patch(
  "/quotes/:id/approve",
  adminAuthMiddleware,
  controller.approveQuote
);
router.patch("/quotes/:id/reject", adminAuthMiddleware, controller.rejectQuote);
router.delete("/quotes/:id", adminAuthMiddleware, controller.deleteQuote);
// router.get("/users", controller.getAllUsers);

export default router;
