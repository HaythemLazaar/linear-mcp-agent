import z from "zod";

export const workingMemorySchema = z.object({
  linearTeamId: z
    .string()
    .optional()
    .describe("Store the Linear team ID if provided"), // Store the Linear team ID if provided
  linearProjectId: z
    .string()
    .optional()
    .describe("Store the Linear project ID if provided"), // Store the Linear project ID if provided
});
