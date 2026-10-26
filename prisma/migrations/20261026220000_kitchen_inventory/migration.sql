ALTER TYPE "MovementType" ADD VALUE 'KITCHEN_ISSUE';
ALTER TYPE "MovementType" ADD VALUE 'KITCHEN_RETURN';

CREATE TABLE "kitchen_issues" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "receiverName" TEXT NOT NULL,
    "issuedQuantity" DECIMAL(12,4) NOT NULL,
    "returnedQuantity" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kitchen_issues_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "kitchen_issues_createdAt_idx" ON "kitchen_issues"("createdAt");

ALTER TABLE "kitchen_issues" ADD CONSTRAINT "kitchen_issues_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "kitchen_issues" ADD CONSTRAINT "kitchen_issues_locationId_fkey"
    FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "kitchen_issues" ADD CONSTRAINT "kitchen_issues_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "permissions" ("id", "resource", "action", "label")
VALUES ('kitchen-inventory-manage', 'kitchen_inventory', 'manage', 'Manage Kitchen Inventory')
ON CONFLICT ("resource", "action") DO UPDATE SET "label" = EXCLUDED."label";

INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT "roles"."id", "permissions"."id"
FROM "roles"
JOIN "permissions" ON "permissions"."resource" = 'kitchen_inventory'
    AND "permissions"."action" = 'manage'
WHERE "roles"."name" IN ('Admin', 'Manager')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
