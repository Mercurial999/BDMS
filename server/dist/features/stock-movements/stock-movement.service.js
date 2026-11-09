import { stockMovementRepository } from "./stock-movement.repository.js";
import { inventoryRepository } from "../inventory/inventory.repository.js";
import { productRepository } from "../products/product.repository.js";
import { ValidationError, NotFoundError, } from "../../shared/errors/index.js";
import { prisma } from "../../database/prisma.js";
export class StockMovementService {
    async createMovement(data) {
        if (!Number.isInteger(data.quantity)) {
            throw new ValidationError("Movement quantity must be a whole number.");
        }
        if (data.quantity <= 0) {
            throw new ValidationError("Movement quantity must be greater than zero.");
        }
        const movement = await prisma.$transaction(async (tx) => {
            const inventory = await inventoryRepository.findForUpdate(data.inventoryId, tx);
            if (!inventory) {
                throw new NotFoundError("Inventory not found.");
            }
            const product = await productRepository.findById(inventory.productId);
            if (!product) {
                throw new NotFoundError("Product not found.");
            }
            if (product.status === "INACTIVE") {
                throw new ValidationError("Cannot create stock movement for an inactive product.");
            }
            const currentQuantity = Number(inventory.quantity);
            let newQuantity;
            if (data.type === "IN") {
                newQuantity =
                    currentQuantity + data.quantity;
            }
            else if (data.type === "OUT") {
                newQuantity =
                    currentQuantity - data.quantity;
                if (newQuantity < 0) {
                    throw new ValidationError("Insufficient inventory quantity.");
                }
            }
            else {
                // ADJUSTMENT quantity represents the new physical stock count.
                newQuantity = data.quantity;
            }
            const movement = await stockMovementRepository.create(data, tx);
            await inventoryRepository.update(data.inventoryId, {
                quantity: newQuantity,
            }, tx);
            return movement;
        });
        return movement;
    }
    async getMovements() {
        return stockMovementRepository.findAll();
    }
    async getMovementById(id) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new ValidationError("Invalid stock movement ID.");
        }
        const movement = await stockMovementRepository.findById(id);
        if (!movement) {
            throw new NotFoundError("Stock movement not found.");
        }
        return movement;
    }
    async getMovementsByInventoryId(inventoryId) {
        if (!Number.isInteger(inventoryId) ||
            inventoryId <= 0) {
            throw new ValidationError("Invalid inventory ID.");
        }
        const inventory = await inventoryRepository.findById(inventoryId);
        if (!inventory) {
            throw new NotFoundError("Inventory not found.");
        }
        return stockMovementRepository.findByInventoryId(inventoryId);
    }
}
export const stockMovementService = new StockMovementService();
