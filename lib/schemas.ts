import z from "zod";

const teamsSchema = z.object({
  teams: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
  ),
});

const projectsSchema = z.object({
  projects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
      url: z.string().optional(),
      description: z.string().optional(),
      summary: z.string().optional(),
      startDate: z.string().optional(),
    })
  ),
});

export { teamsSchema, projectsSchema };
