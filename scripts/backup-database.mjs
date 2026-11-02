import { randomUUID } from "node:crypto";
import { chmod, mkdir, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import nextEnv from "@next/env";

const retentionCount = 5;
const backupPrefix = "database-backup-";
const backupPattern = /^database-backup-\d{4}-\d{2}-\d{2}\.sql$/;

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set to create a database backup.");
}

const database = new URL(databaseUrl);
if (!["postgres:", "postgresql:"].includes(database.protocol)) {
  throw new Error("DATABASE_URL must use the postgres or postgresql protocol.");
}

const password = decodeURIComponent(database.password);
database.password = "";
for (const parameter of [
  "schema",
  "connection_limit",
  "pool_timeout",
  "pgbouncer",
  "sslaccept",
  "sslidentity",
  "sslpassword",
  "socket_timeout",
]) {
  database.searchParams.delete(parameter);
}

const backupDirectory = path.resolve(
  process.env.DATABASE_BACKUP_DIR || "backups/database"
);
await mkdir(backupDirectory, { recursive: true });

const date = new Date().toISOString().slice(0, 10);
const backupPath = path.join(backupDirectory, `${backupPrefix}${date}.sql`);
const temporaryPath = `${backupPath}.${randomUUID()}.tmp`;

try {
  await new Promise((resolve, reject) => {
    const dump = spawn(
      "pg_dump",
      ["--dbname", database.toString(), "--no-owner", "--no-acl", "--file", temporaryPath],
      {
        env: {
          ...process.env,
          ...(password ? { PGPASSWORD: password } : {}),
        },
        stdio: "inherit",
      }
    );

    dump.once("error", reject);
    dump.once("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pg_dump exited with status ${code ?? "unknown"}.`));
      }
    });
  });

  await chmod(temporaryPath, 0o600);
  await rename(temporaryPath, backupPath);

  const backups = (await readdir(backupDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && backupPattern.test(entry.name))
    .map((entry) => entry.name)
    .sort()
    .reverse();

  await Promise.all(
    backups
      .slice(retentionCount)
      .map((filename) => rm(path.join(backupDirectory, filename)))
  );

  console.log(`Database backup saved to ${backupPath}`);
} catch (error) {
  await rm(temporaryPath, { force: true });
  throw error;
}
