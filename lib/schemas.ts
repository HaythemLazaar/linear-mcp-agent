import z from "zod";

const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const teamsSchema = z.object({
  teams: z.array(teamSchema),
});

const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  url: z.string().url().optional(),
  description: z.string().optional(),
  summary: z.string().optional(),
  startDate: z.string().optional(),
});

const projectsSchema = z.object({
  projects: z.array(projectSchema),
});

export { teamSchema, teamsSchema, projectSchema, projectsSchema };
