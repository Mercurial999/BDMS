import { z } from "zod";

export const createStockMovementSchema = z
  .object({
    inventoryId: z
      .number()
      .int()
      .positive("Inventory ID must be a positive number."),

    type: z.enum([
      "IN",
      "OUT",
      "ADJUSTMENT",
    ]),

    reason: z.enum([
      "PURCHASE",
      "SALE",
      "DAMAGE",
      "RETURN",
      "MANUAL_ADJUSTMENT",
    ]),

    quantity: z
      .number()
      .positive("Quantity must be greater than zero."),

    reference: z
      .string()
      .trim()
      .optional(),

    notes: z
      .string()
      .trim()
      .optional(),
  })
  .superRefine((data, ctx) => {
    const isValidCombination =
      (data.type === "IN" &&
        (data.reason === "PURCHASE" ||
          data.reason === "RETURN")) ||

      (data.type === "OUT" &&
        (data.reason === "SALE" ||
          data.reason === "DAMAGE")) ||

      (data.type === "ADJUSTMENT" &&
        data.reason === "MANUAL_ADJUSTMENT");

    if (!isValidCombination) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message:
          `Reason "${data.reason}" is not valid for movement type "${data.type}".`,
      });
    }

    if (
      data.type === "ADJUSTMENT" &&
      !data.reference &&
      !data.notes
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["reference"],
        message:
          "Adjustment requires a reference or notes.",
      });
    }
  });