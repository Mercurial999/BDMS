import { inventoryRepository } from "./inventory.repository.js";
import { productRepository } from "../products/product.repository.js";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../shared/errors/index.js";

export class InventoryService {
  async getAllInventory() {
    const inventory = await inventoryRepository.findAll();

    return inventory.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      minimumStock: item.minimumStock,
      stockStatus: this.getStockStatus(
        Number(item.quantity),
        Number(item.minimumStock)
      ),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  async getInventoryById(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError("Invalid inventory ID.");
    }

    const inventory =
      await inventoryRepository.findById(id);

    if (!inventory) {
      throw new NotFoundError("Inventory not found.");
    }

    return {
      id: inventory.id,
      productId: inventory.productId,
      productName: inventory.product.name,
      quantity: inventory.quantity,
      minimumStock: inventory.minimumStock,
      stockStatus: this.getStockStatus(
        Number(inventory.quantity),
        Number(inventory.minimumStock)
      ),
      createdAt: inventory.createdAt,
      updatedAt: inventory.updatedAt,
    };
  }

  async createInventory(data: {
    productId: number;
    quantity: number;
    minimumStock: number;
  }) {
    // Business rule 1:
    // Quantity cannot be negative.
    if (data.quantity < 0) {
      throw new ValidationError(
        "Quantity cannot be negative."
      );
    }

    // Business rule 2:
    // Minimum stock cannot be negative.
    if (data.minimumStock < 0) {
      throw new ValidationError(
        "Minimum stock cannot be negative."
      );
    }

    // Business rule 3:
    // Product must exist.
    const product =
      await productRepository.findById(
        data.productId
      );

    if (!product) {
      throw new NotFoundError(
        "Product not found."
      );
    }

    // Business rule 4:
    // Product must be active.
    if (product.status !== "ACTIVE") {
      throw new ConflictError(
        "Cannot create inventory for an inactive product."
      );
    }

    // Business rule 5:
    // Product can have only one inventory record.
    const existingInventory =
      await inventoryRepository.findByProductId(
        data.productId
      );

    if (existingInventory) {
      throw new ConflictError(
        "Inventory already exists for this product."
      );
    }

    return inventoryRepository.create(data);
  }

  async updateInventory(
    id: number,
    data: {
      quantity?: number;
      minimumStock?: number;
    }
  ) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError(
        "Invalid inventory ID."
      );
    }

    const inventory =
      await inventoryRepository.findById(id);

    if (!inventory) {
      throw new NotFoundError(
        "Inventory not found."
      );
    }

    if (
      data.quantity !== undefined &&
      data.quantity < 0
    ) {
      throw new ValidationError(
        "Quantity cannot be negative."
      );
    }

    if (
      data.minimumStock !== undefined &&
      data.minimumStock < 0
    ) {
      throw new ValidationError(
        "Minimum stock cannot be negative."
      );
    }

    return inventoryRepository.update(
      id,
      data
    );
  }

  private getStockStatus(
    quantity: number,
    minimumStock: number
  ): "NORMAL" | "LOW_STOCK" | "OUT_OF_STOCK" {
    if (quantity === 0) {
      return "OUT_OF_STOCK";
    }

    if (quantity <= minimumStock) {
      return "LOW_STOCK";
    }

    return "NORMAL";
  }
}

export const inventoryService =
  new InventoryService();