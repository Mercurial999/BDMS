import { Router } from "express";
import { reportsController } from "./reports.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/permission.middleware.js";

const router = Router();

router.get("/sales/summary", authenticate, authorize("reports.read"), reportsController.getSalesSummary.bind(reportsController));
router.get("/sales/details", authenticate, authorize("reports.read"), reportsController.getSalesDetails.bind(reportsController));
router.get("/sales/products", authenticate, authorize("reports.read"), reportsController.getProductSales.bind(reportsController));
router.get("/sales/customers", authenticate, authorize("reports.read"), reportsController.getCustomerSales.bind(reportsController));
router.get("/inventory", authenticate, authorize("reports.read"), reportsController.getInventoryReport.bind(reportsController));
router.get("/stock-movements", authenticate, authorize("reports.read"), reportsController.getStockMovementReport.bind(reportsController));
router.get("/deliveries", authenticate, authorize("reports.read"), reportsController.getDeliveryReport.bind(reportsController));

export default router;
