import z from "zod";

export const workingMemorySchema = z.object({
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
});
