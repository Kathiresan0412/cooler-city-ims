import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Permission constants ─────────────────────────────────────────────────────

const PERMISSIONS: { resource: string; action: string; label: string }[] = [
  // Products
  { resource: "products", action: "read", label: "View Products" },
  { resource: "products", action: "create", label: "Create Products" },
  { resource: "products", action: "update", label: "Update Products" },
  { resource: "products", action: "delete", label: "Delete Products" },
  // Categories / Brands / Units
  { resource: "categories", action: "read", label: "View Categories" },
  { resource: "categories", action: "manage", label: "Manage Categories" },
  { resource: "brands", action: "read", label: "View Brands" },
  { resource: "brands", action: "manage", label: "Manage Brands" },
  { resource: "units", action: "read", label: "View Units" },
  { resource: "units", action: "manage", label: "Manage Units" },
  // Locations
  { resource: "locations", action: "read", label: "View Locations" },
  { resource: "locations", action: "manage", label: "Manage Locations" },
  // Stock
  { resource: "stock", action: "read", label: "View Stock" },
  { resource: "stock", action: "adjust", label: "Adjust Stock" },
  { resource: "stock", action: "open", label: "Set Opening Stock" },
  // GRN
  { resource: "grn", action: "read", label: "View GRNs" },
  { resource: "grn", action: "create", label: "Create GRNs" },
  { resource: "grn", action: "confirm", label: "Confirm GRNs" },
  // Transfers
  { resource: "transfers", action: "read", label: "View Transfers" },
  { resource: "transfers", action: "create", label: "Create Transfers" },
  { resource: "transfers", action: "approve", label: "Approve Transfers" },
  { resource: "transfers", action: "dispatch", label: "Dispatch Transfers" },
  { resource: "transfers", action: "receive", label: "Receive Transfers" },
  // Requests
  { resource: "requests", action: "read", label: "View Requests" },
  { resource: "requests", action: "create", label: "Create Requests" },
  { resource: "requests", action: "approve", label: "Approve Requests" },
  { resource: "requests", action: "issue", label: "Issue from Requests" },
  // Purchase Orders
  { resource: "purchase_orders", action: "read", label: "View Purchase Orders" },
  { resource: "purchase_orders", action: "create", label: "Create Purchase Orders" },
  { resource: "purchase_orders", action: "update", label: "Update Purchase Orders" },
  // Sales
  { resource: "sales", action: "read", label: "View Sales" },
  { resource: "sales", action: "create", label: "Create Sales" },
  { resource: "sales", action: "confirm", label: "Confirm Sales" },
  // Returns
  { resource: "returns", action: "read", label: "View Returns" },
  { resource: "returns", action: "create", label: "Create Returns" },
  // Stock Take
  { resource: "stock_take", action: "read", label: "View Stock Takes" },
  { resource: "stock_take", action: "create", label: "Create Stock Takes" },
  { resource: "stock_take", action: "approve", label: "Approve Stock Takes" },
  // Barcode
  { resource: "barcode", action: "print", label: "Print Barcodes" },
  { resource: "barcode", action: "scan", label: "Scan Barcodes" },
  // Reports
  { resource: "reports", action: "read", label: "View Reports" },
  { resource: "reports", action: "export", label: "Export Reports" },
  // Notifications
  { resource: "notifications", action: "read", label: "View Notifications" },
  // Audit Logs
  { resource: "audit_logs", action: "read", label: "View Audit Logs" },
  // Admin
  { resource: "users", action: "read", label: "View Users" },
  { resource: "users", action: "create", label: "Create Users" },
  { resource: "users", action: "update", label: "Update Users" },
  { resource: "users", action: "delete", label: "Delete Users" },
  { resource: "roles", action: "read", label: "View Roles" },
  { resource: "roles", action: "manage", label: "Manage Roles" },
  { resource: "settings", action: "read", label: "View Settings" },
  { resource: "settings", action: "manage", label: "Manage Settings" },
];

// ─── Sample product data ──────────────────────────────────────────────────────

const SAMPLE_PRODUCTS = [
  { name: "Mineral Water 500ml", sku: "BVWT-500", barcode: "6001234000001", costPrice: 0.5, sellingPrice: 1.0 },
  { name: "Mineral Water 1L", sku: "BVWT-1000", barcode: "6001234000002", costPrice: 0.8, sellingPrice: 1.5 },
  { name: "Coca-Cola 330ml Can", sku: "COLA-330C", barcode: "6001234000003", costPrice: 0.6, sellingPrice: 1.2 },
  { name: "Coca-Cola 1.5L PET", sku: "COLA-1500P", barcode: "6001234000004", costPrice: 1.2, sellingPrice: 2.5 },
  { name: "Sprite 330ml Can", sku: "SPRT-330C", barcode: "6001234000005", costPrice: 0.6, sellingPrice: 1.2 },
  { name: "Orange Juice 1L", sku: "OJ-1000", barcode: "6001234000006", costPrice: 1.5, sellingPrice: 3.0 },
  { name: "Energy Drink 250ml", sku: "ENRG-250", barcode: "6001234000007", costPrice: 1.0, sellingPrice: 2.5 },
  { name: "Iced Tea 500ml", sku: "ICT-500", barcode: "6001234000008", costPrice: 0.9, sellingPrice: 1.8 },
  { name: "Chocolate Bar 50g", sku: "CHOC-50", barcode: "6001234000009", costPrice: 0.4, sellingPrice: 1.0 },
  { name: "Potato Chips 100g", sku: "CHIP-100", barcode: "6001234000010", costPrice: 0.8, sellingPrice: 1.5 },
  { name: "Cup Noodles Chicken", sku: "NDLE-CHK", barcode: "6001234000011", costPrice: 0.5, sellingPrice: 1.0 },
  { name: "Canned Tuna 185g", sku: "TUNA-185", barcode: "6001234000012", costPrice: 1.2, sellingPrice: 2.5 },
  { name: "Disposable Cup 8oz (50pk)", sku: "DCUP-8-50", barcode: "6001234000013", costPrice: 1.5, sellingPrice: 3.0 },
  { name: "Paper Straw (200pk)", sku: "PSTR-200", barcode: "6001234000014", costPrice: 2.0, sellingPrice: 4.0 },
  { name: "Serviette Napkin (500pk)", sku: "NAPK-500", barcode: "6001234000015", costPrice: 1.0, sellingPrice: 2.0 },
  { name: "Hand Sanitizer 250ml", sku: "SANIT-250", barcode: "6001234000016", costPrice: 2.5, sellingPrice: 4.5 },
  { name: "Dishwashing Liquid 500ml", sku: "DISH-500", barcode: "6001234000017", costPrice: 1.8, sellingPrice: 3.5 },
  { name: "Freezer Bag (Large, 10pk)", sku: "FBAG-L10", barcode: "6001234000018", costPrice: 1.5, sellingPrice: 3.0 },
  { name: "Ice Pack 1kg", sku: "ICPK-1000", barcode: "6001234000019", costPrice: 3.0, sellingPrice: 6.0 },
  { name: "Sugar 1kg", sku: "SUGR-1000", barcode: "6001234000020", costPrice: 1.0, sellingPrice: 2.0 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Permissions
  console.log("  Creating permissions...");
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: { label: perm.label },
      create: perm,
    });
  }

  // 2. Roles
  console.log("  Creating roles...");
  const allPermissions = await prisma.permission.findMany();

  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      description: "Full system access",
      isSystem: true,
      permissions: {
        create: allPermissions.map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const managerPermissions = allPermissions.filter(
    (p) => !["users", "roles", "settings"].includes(p.resource) || p.action === "read"
  );
  const managerRole = await prisma.role.upsert({
    where: { name: "Manager" },
    update: {},
    create: {
      name: "Manager",
      description: "Manage inventory, approve transfers and stock takes",
      isSystem: true,
      permissions: {
        create: managerPermissions.map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const staffPermissions = allPermissions.filter((p) =>
    ["products", "stock", "grn", "transfers", "requests", "sales", "barcode", "notifications"].includes(p.resource) &&
    ["read", "create", "scan"].includes(p.action)
  );
  const staffRole = await prisma.role.upsert({
    where: { name: "Staff" },
    update: {},
    create: {
      name: "Staff",
      description: "View and create day-to-day transactions",
      isSystem: true,
      permissions: {
        create: staffPermissions.map((p) => ({ permissionId: p.id })),
      },
    },
  });

  // 3. Admin user
  console.log("  Creating admin user...");
  const passwordHash = await bcrypt.hash("Admin@1234", 12);
  await prisma.user.upsert({
    where: { email: "admin@coolercity.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@coolercity.com",
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  // 4. Locations
  console.log("  Creating locations...");
  const warehouse = await prisma.location.upsert({
    where: { code: "WH-MAIN" },
    update: {},
    create: { name: "Main Warehouse", code: "WH-MAIN", isWarehouse: true, address: "123 Cooler City Rd" },
  });
  await prisma.location.upsert({
    where: { code: "SHP-01" },
    update: {},
    create: { name: "Shop Floor 1", code: "SHP-01", isWarehouse: false },
  });
  await prisma.location.upsert({
    where: { code: "SHP-02" },
    update: {},
    create: { name: "Shop Floor 2", code: "SHP-02", isWarehouse: false },
  });
  await prisma.location.upsert({
    where: { code: "KTCHN" },
    update: {},
    create: { name: "Kitchen Store", code: "KTCHN", isWarehouse: false },
  });

  // 5. Catalogue — category, brand, unit
  console.log("  Creating catalogue setup...");
  const beverageCategory = await prisma.category.upsert({
    where: { name: "Beverages" },
    update: {},
    create: { name: "Beverages" },
  });
  const snackCategory = await prisma.category.upsert({
    where: { name: "Snacks & Confectionery" },
    update: {},
    create: { name: "Snacks & Confectionery" },
  });
  const supplyCategory = await prisma.category.upsert({
    where: { name: "Consumable Supplies" },
    update: {},
    create: { name: "Consumable Supplies" },
  });
  const groceryCategory = await prisma.category.upsert({
    where: { name: "Grocery & Dry Goods" },
    update: {},
    create: { name: "Grocery & Dry Goods" },
  });

  const pcsUnit = await prisma.unit.upsert({
    where: { abbreviation: "pcs" },
    update: {},
    create: { name: "Piece", abbreviation: "pcs" },
  });

  // 6. Sample products
  console.log("  Creating 20 sample products...");
  const categoryMap: Record<string, string> = {
    "BVWT-500": beverageCategory.id,
    "BVWT-1000": beverageCategory.id,
    "COLA-330C": beverageCategory.id,
    "COLA-1500P": beverageCategory.id,
    "SPRT-330C": beverageCategory.id,
    "OJ-1000": beverageCategory.id,
    "ENRG-250": beverageCategory.id,
    "ICT-500": beverageCategory.id,
    "CHOC-50": snackCategory.id,
    "CHIP-100": snackCategory.id,
    "NDLE-CHK": groceryCategory.id,
    "TUNA-185": groceryCategory.id,
    "DCUP-8-50": supplyCategory.id,
    "PSTR-200": supplyCategory.id,
    "NAPK-500": supplyCategory.id,
    "SANIT-250": supplyCategory.id,
    "DISH-500": supplyCategory.id,
    "FBAG-L10": supplyCategory.id,
    "ICPK-1000": supplyCategory.id,
    "SUGR-1000": groceryCategory.id,
  };

  for (const product of SAMPLE_PRODUCTS) {
    const created = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        reorderPoint: 10,
        unitId: pcsUnit.id,
        categoryId: categoryMap[product.sku],
        isActive: true,
      },
    });

    // Set opening stock in main warehouse
    await prisma.stock.upsert({
      where: { productId_locationId: { productId: created.id, locationId: warehouse.id } },
      update: {},
      create: { productId: created.id, locationId: warehouse.id, quantity: 50 },
    });
  }

  // 7. Sequences
  console.log("  Creating sequences...");
  for (const prefix of ["GRN", "TRF", "PO", "SALE", "ADJ", "REQ", "STK"]) {
    await prisma.sequence.upsert({
      where: { prefix },
      update: {},
      create: { prefix, current: 0, padding: 4 },
    });
  }

  // 8. Default settings
  console.log("  Creating default settings...");
  const defaults: { key: string; value: string }[] = [
    { key: "shop_name", value: "Cooler City" },
    { key: "currency", value: "USD" },
    { key: "currency_symbol", value: "$" },
    { key: "tax_rate", value: "0" },
    { key: "low_stock_alert", value: "true" },
    { key: "date_format", value: "DD/MM/YYYY" },
  ];
  for (const s of defaults) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log("✅ Seed complete.");
  console.log("   Admin email:    admin@coolercity.com");
  console.log("   Admin password: Admin@1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
