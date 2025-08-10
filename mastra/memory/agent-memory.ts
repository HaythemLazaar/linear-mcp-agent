import { Memory } from "@mastra/memory";
import { mastraStorage } from "./storage";
import { workingMemorySchema } from "./working-memory-schmea";

const memory = new Memory({
  storage: mastraStorage,
  options: {
    threads: {
      generateTitle: true, // Enable automatic title generation
    },
    workingMemory: {
      enabled: true,
      scope: "thread",
      schema: workingMemorySchema,
    },
  },
});

export { memory };
