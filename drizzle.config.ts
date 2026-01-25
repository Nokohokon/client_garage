import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts", // Wo dein Schema liegt
  out: "./drizzle",         // Wo Migrationen gespeichert werden
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});