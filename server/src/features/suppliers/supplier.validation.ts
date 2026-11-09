import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().trim().min(1, "Supplier name is required."),
  contactPerson: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const updateSupplierSchema = z.object({
  name: z.string().trim().min(1, "Supplier name cannot be empty.").optional(),
  contactPerson: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const supplierQuerySchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
