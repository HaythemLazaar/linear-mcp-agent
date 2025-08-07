import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { mastraStorage } from "../memory/storage";
import { workingMemorySchema } from "../memory/working-memory-schmea";

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

export const linearAgent = new Agent({
  name: "Project planning Agent",
  instructions: `
      You are a helpful assistant that helps users create issues, project...
      Use the tools from the connected Linear MCP, when user asks to.
  `,  
  model: google("gemini-2.5-flash"),
  memory,
});
