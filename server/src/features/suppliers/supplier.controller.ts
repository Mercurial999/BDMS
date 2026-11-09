import {
  Request,
  Response,
  NextFunction,
} from "express";

import { SupplierService } from "./supplier.service.js";

export class SupplierController {
  constructor(
    private readonly supplierService = new SupplierService()
  ) {}

  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const status =
        req.query.status === "ACTIVE" ||
        req.query.status === "INACTIVE"
          ? req.query.status
          : undefined;

      const suppliers =
        await this.supplierService.getAllSuppliers(status);

      res.status(200).json({
        success: true,
        data: suppliers,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);

      const supplier =
        await this.supplierService.getSupplierById(id);

      res.status(200).json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const supplier =
        await this.supplierService.createSupplier(req.body);

      res.status(201).json({
        success: true,
        message: "Supplier created successfully.",
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);

      const supplier =
        await this.supplierService.updateSupplier(
          id,
          req.body
        );

      res.status(200).json({
        success: true,
        message: "Supplier updated successfully.",
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);

      await this.supplierService.deactivateSupplier(id);

      res.status(200).json({
        success: true,
        message: "Supplier deactivated successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}
