import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./db/schema/index.js";

const SQLITE_PATH =
  process.env.SQLITE_PATH ?? join(process.cwd(), "data", "reminder.db");

mkdirSync(dirname(SQLITE_PATH), { recursive: true });

const sqlite = new Database(SQLITE_PATH);

export const db = drizzle(sqlite, { schema });

export function runMigrations(): void {
  migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
}
