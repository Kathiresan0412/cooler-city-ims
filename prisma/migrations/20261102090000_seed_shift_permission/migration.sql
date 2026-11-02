INSERT INTO "permissions" ("id", "resource", "action", "label")
VALUES ('shifts-manage', 'shifts', 'manage', 'Manage Shifts and Leave')
ON CONFLICT ("resource", "action") DO UPDATE SET "label" = EXCLUDED."label";

INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT "roles"."id", "permissions"."id"
FROM "roles"
JOIN "permissions" ON "permissions"."resource" = 'shifts'
    AND "permissions"."action" = 'manage'
WHERE "roles"."name" IN ('Admin', 'Manager')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
