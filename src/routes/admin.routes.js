import { Router } from "express";
import controller from "../controllers/admin.controller.js";

const router = Router();


router.get("/quotes", controller.getPendingQuotes);
router.patch("/quotes/:id/approve", controller.approveQuote);
router.patch("/quotes/:id/reject", controller.rejectQuote);
router.delete("/quotes/:id", controller.deleteQuote);
// router.get("/users", controller.getAllUsers); 

export default router;
