import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import z from "zod";

const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:../mastra.db",
  }),
  options: {
    threads: {
      generateTitle: true, // Enable automatic title generation
    },
    workingMemory: {
      enabled: true,
      scope: "thread",
      schema: z.object({
        projectGoal: z
          .string()
          .optional()
          .describe("Store the project goal provided by the user"), // Store the project goal provided by the user
        linearTeamId: z
          .string()
          .optional()
          .describe("Store the Linear team ID if provided"), // Store the Linear team ID if provided
        linearProjectId: z
          .string()
          .optional()
          .describe("Store the Linear project ID if provided"), // Store the Linear project ID if provided
        prdId: z.string().optional().describe("Store the PRD document ID"), // Store the PRD document ID
        issues: z
          .array(
            z.object({
              id: z.string().describe("The ID of the issue created in Linear"), // The ID of the issue created in Linear
              title: z.string().describe("The title of the issue created"), // The title of the issue created
              description: z
                .string()
                .optional()
                .describe("The description of the issue created"), // The description of the issue created
            })
          )
          .optional()
          .describe("Store the list of issue IDs created for the project"), // Store the list of issue IDs created for the project
      }),
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
