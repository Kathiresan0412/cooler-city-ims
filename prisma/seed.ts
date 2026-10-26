import { PrismaClient } from "@prisma/client";
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
  { resource: "kitchen_inventory", action: "manage", label: "Manage Kitchen Inventory" },
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
  const allPermissions: Array<{ id: string; resource: string; action: string }> = await prisma.permission.findMany();

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
    (p: { id: string; resource: string; action: string }) => !["users", "roles", "settings"].includes(p.resource) || p.action === "read"
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

  const staffPermissions = allPermissions.filter(
    (p: { id: string; resource: string; action: string }) =>
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
  const kitchenPermission = allPermissions.find(
    (permission) => permission.resource === "kitchen_inventory" && permission.action === "manage"
  );
  if (!kitchenPermission) throw new Error("Kitchen Inventory permission was not seeded");
  for (const role of [adminRole, managerRole]) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: kitchenPermission.id } },
      update: {},
      create: { roleId: role.id, permissionId: kitchenPermission.id },
    });
  }
  void managerRole;
  void staffRole;

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
  await prisma.location.upsert({
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
  await prisma.category.upsert({
    where: { name: "Beverages" },
    update: {},
    create: { name: "Beverages" },
  });
  await prisma.category.upsert({
    where: { name: "Snacks & Confectionery" },
    update: {},
    create: { name: "Snacks & Confectionery" },
  });
  await prisma.category.upsert({
    where: { name: "Consumable Supplies" },
    update: {},
    create: { name: "Consumable Supplies" },
  });
  await prisma.category.upsert({
    where: { name: "Grocery & Dry Goods" },
    update: {},
    create: { name: "Grocery & Dry Goods" },
  });

  await prisma.unit.upsert({
    where: { abbreviation: "pcs" },
    update: {},
    create: { name: "Piece", abbreviation: "pcs" },
  });

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
