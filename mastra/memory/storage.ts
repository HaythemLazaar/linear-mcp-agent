import { PostgresStore } from "@mastra/pg";

export const mastraStorage = new PostgresStore({
  schemaName: "mastra",
  connectionString: process.env.DATABASE_URL || "",
});
