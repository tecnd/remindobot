import { defineConfig } from "drizzle-kit";

const url = process.env.SQLITE_PATH ?? "data/reminder.db";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url },
});
