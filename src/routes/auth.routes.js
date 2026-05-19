import { Router } from "express";
import controller from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logoutUser);

export default router;
