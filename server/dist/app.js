import express from "express";
import routes from "./routes/index.js";
import inventoryRoutes from "./features/inventory/inventory.routes.js";
import permissionRoutes from "./features/permissions/permission.routes.js";
import productRoutes from "./features/products/product.routes.js";
import stockMovementRoutes from "./features/stock-movements/stock-movement.routes.js";
import customerRoutes from "./features/customers/customer.routes.js";
import deliveryRoutes from "./features/deliveries/delivery.routes.js";
import orderRoutes from "./features/orders/order.routes.js";
import dashboardRoutes from "./features/dashboard/dashboard.routes.js";
import supplierRoutes from "./features/suppliers/supplier.routes.js";
import cors from "cors";
import { errorMiddleware } from "./middleware/error.middleware.js";
const app = express();
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
    ],
}));
app.use(express.json());
app.get("/", (req, res) => {
    res.send("Inventory System Backend is running!");
});
app.use("/api", routes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/stock-movements", stockMovementRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use(errorMiddleware);
export default app;
