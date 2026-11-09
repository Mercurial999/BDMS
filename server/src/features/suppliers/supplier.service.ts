import { SupplierRepository } from "./supplier.repository.js";
import {
  AppError,
  ValidationError,
} from "../../shared/errors/index.js";

type SupplierStatus = "ACTIVE" | "INACTIVE";

export class SupplierService {
  constructor(
    private readonly supplierRepository = new SupplierRepository()
  ) {}

  async getAllSuppliers(status?: SupplierStatus) {
    return this.supplierRepository.findAll(status);
  }

  async getSupplierById(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError("Invalid supplier ID.");
    }

    const supplier = await this.supplierRepository.findById(id);

    if (!supplier) {
      throw new AppError("Supplier not found.", 404);
    }

    return supplier;
  }

  async createSupplier(data: {
    name: string;
    contactPerson?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }) {
    const existingSupplier =
      await this.supplierRepository.findByNameInsensitive(data.name);

    if (existingSupplier) {
      throw new AppError("Supplier name already exists.", 409);
    }

    return this.supplierRepository.create(data);
  }

  async updateSupplier(
    id: number,
    data: {
      name?: string;
      contactPerson?: string;
      phone?: string;
      address?: string;
      notes?: string;
      status?: SupplierStatus;
    }
  ) {
    await this.getSupplierById(id);

    if (data.name !== undefined) {
      const existingSupplier =
        await this.supplierRepository.findByNameInsensitive(data.name);

      if (existingSupplier && existingSupplier.id !== id) {
        throw new AppError("Supplier name already exists.", 409);
      }
    }

    return this.supplierRepository.update(id, data);
  }

  async deactivateSupplier(id: number) {
    const supplier = await this.getSupplierById(id);

    if (supplier.status === "INACTIVE") {
      throw new AppError("Supplier is already inactive.", 409);
    }

    return this.supplierRepository.deactivate(id);
  }
}

export const supplierService = new SupplierService();
