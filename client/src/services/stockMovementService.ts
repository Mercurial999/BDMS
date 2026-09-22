import { apiRequest } from "../lib/api";
import type { StockMovement } from "../types/stock-movement.types";

export interface CreateStockMovementInput {
  inventoryId: number;
  type: "IN" | "OUT" | "ADJUSTMENT";
  reason: "PURCHASE" | "SALE" | "DAMAGE" | "RETURN" | "MANUAL_ADJUSTMENT";
  quantity: number;
  reference?: string;
  notes?: string;
}

export async function getStockMovements(): Promise<StockMovement[]> {
  const response = await apiRequest<{ data: StockMovement[] }>("/stock-movements");
  return response.data;
}

export async function createStockMovement(input: CreateStockMovementInput): Promise<StockMovement> {
  const response = await apiRequest<{ data: StockMovement }>("/stock-movements", {
    method: "POST",
    body: input,
  });
  return response.data;
}
