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
    // Inventory quantities must be whole numbers.
    if (!Number.isInteger(data.quantity)) {
      throw new ValidationError(
        "Quantity must be a whole number."
      );
    }

    if (data.quantity < 0) {
      throw new ValidationError(
        "Quantity cannot be negative."
      );
    }

    if (!Number.isInteger(data.minimumStock)) {
      throw new ValidationError(
        "Minimum stock must be a whole number."
      );
    }

    if (data.minimumStock < 0) {
      throw new ValidationError(
        "Minimum stock cannot be negative."
      );
    }

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

    // Product must be active.
    if (product.status !== "ACTIVE") {
      throw new ConflictError(
        "Cannot create inventory for an inactive product."
      );
    }

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
      data.minimumStock !== undefined &&
      !Number.isInteger(data.minimumStock)
    ) {
      throw new ValidationError(
        "Minimum stock must be a whole number."
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
