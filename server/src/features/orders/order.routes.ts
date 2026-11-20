import { Router } from "express";
import { orderController } from "./order.controller.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
  createOrderSchema,
  addOrderItemSchema,
  updateOrderItemSchema,
  updateOrderSchema,
} from "./order.validation.js";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/permission.middleware.js";

const router = Router();

router.get("/", authenticate, authorize("orders.read"), orderController.getOrders.bind(orderController));
router.get("/:id", authenticate, authorize("orders.read"), orderController.getOrderById.bind(orderController));
router.post("/", authenticate, authorize("orders.create"), validate(createOrderSchema), orderController.createOrder.bind(orderController));
router.post("/:id/items", authenticate, authorize("orders.update"), validate(addOrderItemSchema), orderController.addOrderItem.bind(orderController));
router.patch("/:id/items/:itemId", authenticate, authorize("orders.update"), validate(updateOrderItemSchema), orderController.updateOrderItem.bind(orderController));
router.delete("/:id/items/:itemId", authenticate, authorize("orders.delete"), orderController.deleteOrderItem.bind(orderController));
router.patch("/:id", authenticate, authorize("orders.update"), validate(updateOrderSchema), orderController.updateOrder.bind(orderController));
router.patch("/:id/confirm", authenticate, authorize("orders.update"), orderController.confirmOrder.bind(orderController));
router.patch("/:id/cancel", authenticate, authorize("orders.update"), orderController.cancelOrder.bind(orderController));

export default router;
