import z from "zod";
import { projectsSchema, teamsSchema } from "./schemas";

export interface Attachment {
  name: string;
  url: string;
  contentType: string;
}

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

type LinearTeams = z.infer<typeof teamsSchema>
type LinearTeam = ArrayElement<LinearTeams['teams']>

type LinearProjects = z.infer<typeof projectsSchema>
type LinearProject = ArrayElement<LinearProjects['projects']>

export type {
  LinearProject,
  LinearProjects,
  LinearTeam,
  LinearTeams
}