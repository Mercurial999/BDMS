import { Router } from "express";
import { customerController } from "./customer.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/permission.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("customers.read"),
  customerController.getCustomers.bind(customerController),
);

router.get(
  "/:id",
  authenticate,
  authorize("customers.read"),
  customerController.getCustomerById.bind(customerController),
);

router.post(
  "/",
  authenticate,
  authorize("customers.create"),
  customerController.createCustomer.bind(customerController),
);

router.patch(
  "/:id",
  authenticate,
  authorize("customers.update"),
  customerController.updateCustomer.bind(customerController),
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("customers.delete"),
  customerController.deactivateCustomer.bind(customerController),
);

export default router;
