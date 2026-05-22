import { Router } from "express";
import { userAuthMiddleware } from "../middlewares/user.auth.middleware.js";
import controller from "../controllers/quote.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { quoteSchema } from "../validators/quoteSchema.js";

const router = Router();

router.get("/", controller.getQuotes);

router.post(
  "/",
  userAuthMiddleware,
  validate(quoteSchema),
  controller.createQuote
);
router.get("/me", userAuthMiddleware, controller.getMyQuotes);
router
  .route("/:id")
  .get(controller.getQuoteById)
  .patch(userAuthMiddleware, controller.updateQuoteById)
  .delete(userAuthMiddleware, controller.deleteQuoteById);

export default router;
