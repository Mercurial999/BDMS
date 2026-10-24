import { Router } from "express";
import { orderController } from "./order.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/permission.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
  createOrderSchema,
  addOrderItemSchema,
  updateOrderItemSchema,
  updateOrderSchema,
} from "./order.validation.js";

const router = Router();

// All Orders endpoints require an active authenticated user.
router.use(authenticate);

router.get(
  "/",
  authorize("orders.read"),
  orderController.getOrders.bind(orderController),
);

router.get(
  "/:id",
  authorize("orders.read"),
  orderController.getOrderById.bind(orderController),
);

router.post(
  "/",
  authorize("orders.create"),
  validate(createOrderSchema),
  orderController.createOrder.bind(orderController),
);

router.post(
  "/:id/items",
  authorize("orders.update"),
  validate(addOrderItemSchema),
  orderController.addOrderItem.bind(orderController),
);

router.patch(
  "/:id/items/:itemId",
  authorize("orders.update"),
  validate(updateOrderItemSchema),
  orderController.updateOrderItem.bind(orderController),
);

router.delete(
  "/:id/items/:itemId",
  authorize("orders.update"),
  orderController.deleteOrderItem.bind(orderController),
);

router.patch(
  "/:id",
  authorize("orders.update"),
  validate(updateOrderSchema),
  orderController.updateOrder.bind(orderController),
);

router.patch(
  "/:id/confirm",
  authorize("orders.update"),
  orderController.confirmOrder.bind(orderController),
);

router.patch(
  "/:id/cancel",
  authorize("orders.update"),
  orderController.cancelOrder.bind(orderController),
);

export default router;