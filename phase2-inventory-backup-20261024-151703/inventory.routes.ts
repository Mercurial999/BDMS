import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/permission.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";

import { inventoryController } from "./inventory.controller.js";

import {
  createInventorySchema,
  updateInventorySchema,
} from "./inventory.validation.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("inventory.read"),
  inventoryController.getAll.bind(inventoryController)
);

router.get(
  "/:id",
  authenticate,
  authorize("inventory.read"),
  inventoryController.getById.bind(inventoryController)
);

router.post(
  "/",
  authenticate,
  authorize("inventory.create"),
  validate(createInventorySchema),
  inventoryController.create.bind(inventoryController)
);

router.put(
  "/:id",
  authenticate,
  authorize("inventory.update"),
  validate(updateInventorySchema),
  inventoryController.update.bind(inventoryController)
);

export default router;