import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { memory } from "../memory";

export const linearAgent = new Agent({
  name: "Project planning Agent",
  instructions: `
      You are a helpful assistant that helps users create issues, project...
      Use the tools from the connected Linear MCP, when user asks to.
  `,
  model: google("gemini-2.5-flash"),
  memory,
});
