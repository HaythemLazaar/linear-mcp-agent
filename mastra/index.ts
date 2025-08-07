import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { linearAgent } from "./agents/linear-agent";

export const mastra = new Mastra({
  agents: { linearAgent },
  storage: new LibSQLStore({
    url: "file:../dev-db/mastra.db",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
