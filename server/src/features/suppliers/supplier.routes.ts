import { Router } from "express";

import { SupplierController } from "./supplier.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/permission.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { validateQuery } from "../../middleware/validate-query.middleware.js";

import {
  createSupplierSchema,
  updateSupplierSchema,
  supplierQuerySchema,
} from "./supplier.validation.js";

const router = Router();

const controller = new SupplierController();

router.get(
  "/",
  authenticate,
  authorize("suppliers.read"),
  validateQuery(supplierQuerySchema),
  controller.getAll.bind(controller)
);

router.get(
  "/:id",
  authenticate,
  authorize("suppliers.read"),
  controller.getById.bind(controller)
);

router.post(
  "/",
  authenticate,
  authorize("suppliers.create"),
  validate(createSupplierSchema),
  controller.create.bind(controller)
);

router.put(
  "/:id",
  authenticate,
  authorize("suppliers.update"),
  validate(updateSupplierSchema),
  controller.update.bind(controller)
);

router.delete(
  "/:id",
  authenticate,
  authorize("suppliers.delete"),
  controller.delete.bind(controller)
);

export default router;
