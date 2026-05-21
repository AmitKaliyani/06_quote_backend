import { Router } from "express";
import controller from "../controllers/admin.controller.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", controller.adminLogin);
router.get(
  "/quotes",
  authMiddleware,
  roleMiddleware("admin"),
  controller.getPendingQuotes
);
router.patch(
  "/quotes/:id/approve",
  authMiddleware,
  roleMiddleware("admin"),
  controller.approveQuote
);
router.patch(
  "/quotes/:id/reject",
  authMiddleware,
  roleMiddleware("admin"),
  controller.rejectQuote
);
router.delete(
  "/quotes/:id",
  authMiddleware,
  roleMiddleware("admin"),
  controller.deleteQuote
);
// router.get("/users", controller.getAllUsers);

export default router;
