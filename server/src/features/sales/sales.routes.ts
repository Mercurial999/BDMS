import { Router } from "express";
import { salesController } from "./sales.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/permission.middleware.js";

const router = Router();

router.get(
  "/summary",
  authenticate,
  authorize("sales.read"),
  salesController.getSalesSummary.bind(salesController),
);

export default router;
