import { z } from "zod";
export const createInventorySchema = z.object({
    productId: z
        .number()
        .int()
        .positive("Product ID must be a positive number."),
    quantity: z
        .number()
        .int("Quantity must be a whole number.")
        .nonnegative("Quantity cannot be negative."),
    minimumStock: z
        .number()
        .int("Minimum stock must be a whole number.")
        .nonnegative("Minimum stock cannot be negative."),
});
export const updateInventorySchema = z.object({
    minimumStock: z
        .number()
        .int("Minimum stock must be a whole number.")
        .nonnegative("Minimum stock cannot be negative.")
        .optional(),
});
