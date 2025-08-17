import { Memory } from "@mastra/memory";
import { mastraStorage } from "./storage";

const memory = new Memory({
  storage: mastraStorage,
  options: {
    lastMessages: 10,
    threads: {
      generateTitle: true, // Enable automatic title generation
    },
    workingMemory: {
      enabled: true,
      scope: "thread",
      template: `- Current Linear Project Id:\n- Current Linear Team Id:\n- Current Linear Issue ID:`,
    },
  },
});

export { memory };
