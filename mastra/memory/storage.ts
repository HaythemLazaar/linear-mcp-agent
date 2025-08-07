import { PostgresStore } from "@mastra/pg";

export const mastraStorage = new PostgresStore({
  connectionString: process.env.DATABASE_URL || "",
});
