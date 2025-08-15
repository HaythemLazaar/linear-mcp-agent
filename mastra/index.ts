import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { linearAgent } from "./agents/linear-agent";
import { mastraStorage } from "./memory/storage";

export const mastra = new Mastra({
  agents: { linearAgent },
  storage: mastraStorage,
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
