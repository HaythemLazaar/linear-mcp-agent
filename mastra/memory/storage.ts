import { PostgresStore } from "@mastra/pg";

const mastraStorage = new PostgresStore({
  schemaName: "mastra",
  connectionString: process.env.DATABASE_URL || "",
});

export { mastraStorage };
