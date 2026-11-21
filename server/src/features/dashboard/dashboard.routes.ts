import { Router } from "express";
import { dashboardController } from "./dashboard.controller.js";
import { validateQuery } from "../../middleware/validate-query.middleware.js";

import {
  dashboardOrdersQuerySchema,
  dashboardDeliveriesQuerySchema,
} from "./dashboard.validation.js";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/permission.middleware.js";

const router = Router();

router.get(
  "/sales",
  authenticate,
  authorize("dashboard.read"),
  dashboardController.getSalesSummary.bind(dashboardController),
);

router.get(
  "/deliveries",
  authenticate,
  authorize("dashboard.read"),
  dashboardController.getDeliverySummary.bind(dashboardController),
);

router.get(
  "/deliveries/list",
  authenticate,
  authorize("dashboard.read"),
  validateQuery(dashboardDeliveriesQuerySchema),
  dashboardController.getDeliveries.bind(dashboardController),
);

router.get(
  "/inventory",
  authenticate,
  authorize("dashboard.read"),
  dashboardController.getInventorySummary.bind(dashboardController),
);

router.get(
  "/top-selling",
  authenticate,
  authorize("dashboard.read"),
  dashboardController.getTopSellingProducts.bind(dashboardController),
);

router.get(
  "/in-demand",
  authenticate,
  authorize("dashboard.read"),
  dashboardController.getProductsInDemand.bind(dashboardController),
);

router.get(
  "/recent-orders",
  authenticate,
  authorize("dashboard.read"),
  dashboardController.getRecentOrders.bind(dashboardController),
);

router.get(
  "/orders",
  authenticate,
  authorize("dashboard.read"),
  validateQuery(dashboardOrdersQuerySchema),
  dashboardController.getOrders.bind(dashboardController),
);

router.get(
  "/recent-deliveries",
  authenticate,
  authorize("dashboard.read"),
  dashboardController.getRecentDeliveries.bind(dashboardController),
);

router.get(
  "/summary",
  authenticate,
  authorize("dashboard.read"),
  dashboardController.getSummary.bind(dashboardController),
);

export default router;
