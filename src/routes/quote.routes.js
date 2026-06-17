import { Router } from "express";
import {
  userAuthMiddleware,
  userAuthMiddlewareOptional,
} from "../middlewares/user.auth.middleware.js";
import controller from "../controllers/quote.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { quoteSchema } from "../validators/quoteSchema.js";
import { toggleLike } from "../controllers/like.controller.js";
import { getSavedQuotes, toggleSave } from "../controllers/save.controller.js";

const router = Router();

router.get("/", userAuthMiddlewareOptional, controller.getQuotes);

router.post(
  "/",
  userAuthMiddleware,
  validate(quoteSchema),
  controller.createQuote
);
router.route("/trending-quotes").get(controller.getTrendingQuote);
router.get("/me", userAuthMiddleware, controller.getMyQuotes);
router.route("/saved").get(userAuthMiddleware, getSavedQuotes);
router
  .route("/:id")
  .get(userAuthMiddlewareOptional, controller.getQuoteById)
  .patch(userAuthMiddleware, controller.updateQuoteById)
  .delete(userAuthMiddleware, controller.deleteQuoteById);

router.route("/:id/like").post(userAuthMiddleware, toggleLike);
router.route("/:id/save").post(userAuthMiddleware, toggleSave);

export default router;
