import { Router } from "express";

import { deliveryController } from "./delivery.controller.js";
import { validate } from "../../middleware/validation.middleware.js";
import { createDeliverySchema } from "./delivery.validation.js";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/permission.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("deliveries.read"),
  deliveryController.getDeliveries.bind(deliveryController),
);

router.get(
  "/:id",
  authenticate,
  authorize("deliveries.read"),
  deliveryController.getDeliveryById.bind(deliveryController),
);

router.post(
  "/",
  authenticate,
  authorize("deliveries.create"),
  validate(createDeliverySchema),
  deliveryController.createDelivery.bind(deliveryController),
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("deliveries.update"),
  deliveryController.cancelDelivery.bind(deliveryController),
);

router.patch(
  "/:id/complete",
  authenticate,
  authorize("deliveries.update"),
  deliveryController.completeDelivery.bind(deliveryController),
);

export default router;
