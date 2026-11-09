import { prisma } from "../../database/prisma.js";

type SupplierStatus = "ACTIVE" | "INACTIVE";

export class SupplierRepository {
  async findAll(status?: SupplierStatus) {
    return prisma.supplier.findMany({
      where: status
        ? {
            status,
          }
        : undefined,
      orderBy: {
        name: "asc",
      },
    });
  }

  async findById(id: number) {
    return prisma.supplier.findUnique({
      where: {
        id,
      },
    });
  }

  async findByNameInsensitive(name: string) {
    return prisma.supplier.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });
  }

  async create(data: {
    name: string;
    contactPerson?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }) {
    return prisma.supplier.create({
      data,
    });
  }

  async update(
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
    return prisma.supplier.update({
      where: {
        id,
      },
      data,
    });
  }

  async deactivate(id: number) {
    return prisma.supplier.update({
      where: {
        id,
      },
      data: {
        status: "INACTIVE",
      },
    });
  }
}

export const supplierRepository = new SupplierRepository();
