import { Router } from "express";
import controller from "../controllers/admin.controller.js";
import { adminAuthMiddleware } from "../middlewares/admin.auth.middleware.js";

const router = Router();

router.post("/login", controller.adminLogin);
router.get("/quotes", adminAuthMiddleware, controller.getPendingQuotes);
router.patch(
  "/quotes/:id/approve",
  adminAuthMiddleware,
  controller.approveQuote
);
router.patch("/quotes/:id/reject", adminAuthMiddleware, controller.rejectQuote);
router.delete("/quotes/:id", adminAuthMiddleware, controller.deleteQuote);
// router.get("/users", controller.getAllUsers);

export default router;
