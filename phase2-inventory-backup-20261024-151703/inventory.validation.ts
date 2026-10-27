import { z } from "zod";

export const createInventorySchema = z.object({
  productId: z
    .number()
    .int()
    .positive("Product ID must be a positive number."),

  quantity: z
    .number()
    .nonnegative("Quantity cannot be negative."),

  minimumStock: z
    .number()
    .nonnegative("Minimum stock cannot be negative."),
});

export const updateInventorySchema = z.object({
  quantity: z
    .number()
    .nonnegative("Quantity cannot be negative.")
    .optional(),

  minimumStock: z
    .number()
    .nonnegative("Minimum stock cannot be negative.")
    .optional(),
});