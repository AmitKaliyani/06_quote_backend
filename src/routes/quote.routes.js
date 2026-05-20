import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import controller from "../controllers/quote.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { quoteSchema } from "../validators/quoteSchema.js";

const router = Router();

router.get("/", controller.getQuotes);

router.post("/", authMiddleware,validate(quoteSchema), controller.createQuote);
router.get("/me", authMiddleware, controller.getMyQuotes);
router
  .route("/:id")
  .get(controller.getQuoteById)
  .patch(authMiddleware, controller.updateQuoteById)
  .delete(authMiddleware, controller.deleteQuoteById);

export default router;
