import { Router } from "express";
import controller from "../controllers/health.controller.js";

const router = Router();

router.get("/", controller.healthCheck);
router.get("/live", controller.livenessCheck);
router.get("/ready", controller.readinessCheck);

export default router;
