import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const permissions = [
  
  //permissions
   {
    name: "permissions.read",
    description: "View permissions",
  },
  
  // Users
  {
    name: "users.read",
    description: "View users",
  },
  {
    name: "users.create",
    description: "Create users",
  },
  {
    name: "users.update",
    description: "Update users",
  },
  {
    name: "users.delete",
    description: "Delete users",
  },

  // Roles
  {
    name: "roles.read",
    description: "View roles",
  },
  {
    name: "roles.create",
    description: "Create roles",
  },
  {
    name: "roles.update",
    description: "Update roles",
  },
  {
    name: "roles.delete",
    description: "Delete roles",
  },

  // Products
  {
    name: "products.read",
    description: "View products",
  },
  {
    name: "products.create",
    description: "Create products",
  },
  {
    name: "products.update",
    description: "Update products",
  },
  {
    name: "products.delete",
    description: "Delete products",
  },

  // Inventory
  {
    name: "inventory.read",
    description: "View inventory",
  },
  {
    name: "inventory.create",
    description: "Create inventory records",
  },
  {
    name: "inventory.update",
    description: "Update inventory records",
  },
  {
    name: "inventory.delete",
    description: "Delete inventory records",
  },

  // Suppliers
  {
    name: "suppliers.read",
    description: "View suppliers",
  },
  {
    name: "suppliers.create",
    description: "Create suppliers",
  },
  {
    name: "suppliers.update",
    description: "Update suppliers",
  },
  {
    name: "suppliers.delete",
    description: "Delete suppliers",
  },

  // Customers
  {
    name: "customers.read",
    description: "View customers",
  },
  {
    name: "customers.create",
    description: "Create customers",
  },
  {
    name: "customers.update",
    description: "Update customers",
  },
  {
    name: "customers.delete",
    description: "Delete customers",
  },

  // Deliveries
  {
    name: "deliveries.read",
    description: "View deliveries",
  },
  {
    name: "deliveries.create",
    description: "Create deliveries",
  },
  {
    name: "deliveries.update",
    description: "Update deliveries",
  },
  {
    name: "deliveries.delete",
    description: "Delete deliveries",
  },

  // Sales
  {
    name: "sales.read",
    description: "View sales",
  },
  {
    name: "sales.create",
    description: "Create sales",
  },
  {
    name: "sales.update",
    description: "Update sales",
  },
  {
    name: "sales.delete",
    description: "Delete sales",
  },

  // Orders
  {
    name: "orders.read",
    description: "View orders",
  },
  {
    name: "orders.create",
    description: "Create orders",
  },
  {
    name: "orders.update",
    description: "Update orders",
  },
  {
    name: "orders.delete",
    description: "Delete orders",
  },

  // Reports
  {
    name: "reports.read",
    description: "View reports",
  },
  {
    name: "reports.export",
    description: "Export reports",
  },
];


async function main() {
  // 1. Seed permissions
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permission.name,
      },
      update: {
        description: permission.description,
      },
      create: permission,
    });
  }

  console.log("Permissions seeded successfully.");

  // 2. Find Administrator role
  const administratorRole = await prisma.role.findUnique({
    where: {
      name: "Administrator",
    },
  });

  if (!administratorRole) {
    throw new Error("Administrator role not found.");
  }

  // 3. Give Administrator every permission
  for (const permission of permissions) {
    const permissionRecord =
      await prisma.permission.findUnique({
        where: {
          name: permission.name,
        },
      });

    if (!permissionRecord) {
      throw new Error(
        `Permission ${permission.name} not found.`
      );
    }

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: administratorRole.id,
          permissionId: permissionRecord.id,
        },
      },
      update: {},
      create: {
        roleId: administratorRole.id,
        permissionId: permissionRecord.id,
      },
    });
  }

  console.log(
    "Administrator permissions assigned successfully."
  );

  
}


main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });