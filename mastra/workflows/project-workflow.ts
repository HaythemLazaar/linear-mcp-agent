import { headers } from "next/headers";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { createProject as createProjectQuery } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { createDocumentTool } from "../tools/document-tools";
import { createIssueTool } from "../tools/issues-tools";

const createdProjectSchema = z.object({
  id: z.string().describe("The ID of the project"),
  goal: z.string().describe("The goal of the project"),
  projectName: z.string().describe("The name of the project"),
  projectDescription: z.string().describe("The description of the project"),
});

const startProjectWorkflowSchema = z.object({
  goal: z.string().describe("The goal of the project"),
  linearTeamId: z.string().optional().describe("The ID of the Linear team"),
  linearTeamName: z.string().optional().describe("The name of the Linear team"),
  linearTeamUrl: z.string().optional().describe("The URL of the Linear team"),
  linearProjectId: z
    .string()
    .optional()
    .describe("The ID of the Linear project"),
  linearProjectName: z
    .string()
    .optional()
    .describe("The name of the Linear project"),
  linearProjectUrl: z
    .string()
    .optional()
    .describe("The URL of the Linear project"),
});

const draftedPRDSchema = z.object({
  projectId: z.string().describe("The ID of the project"),
  prdId: z.string().describe("The ID of the PRD document"),
  title: z.string().describe("The title of the PRD"),
  document: z.string().describe("The document of the PRD"),
  projectGoal: z.string().describe("The goal of the project"),
  projectTitle: z.string().describe("The title of the project"),
});

const createdIssuesSchema = z.array(
  z.object({
    id: z.string().describe("The ID of the created issue"),
    title: z.string().describe("The title of the issue"),
    description: z.string().describe("The description of the issue"),
  })
);

const draftedIssuesSchema = z.array(
  z.object({
    details: z.string().describe("The details of the issue to be created"),
  })
);

const createProjectStep = createStep({
  id: "create-project",
  description: "Creates a new project",
  inputSchema: startProjectWorkflowSchema,
  outputSchema: createdProjectSchema,
  execute: async ({ inputData, runtimeContext }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("User not found");
    }

    const projectId = runtimeContext.get("projectId") as string;

    if (!projectId) {
      throw new Error("Project ID not found");
    }

    const {
      object: { projectName, projectDescription },
    } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        projectName: z.string().describe("The name of the project"),
        projectDescription: z
          .string()
          .describe("The description of the project"),
      }),
      prompt: `Create a new project with the following details: ${inputData.goal}`,
    });

    const project = await createProjectQuery({
      id: projectId,
      name: projectName,
      description: projectDescription,
      linearTeamId: inputData.linearTeamId,
      linearProjectId: inputData.linearProjectId,
      linearTeamName: inputData.linearTeamName,
      linearProjectName: inputData.linearProjectName,
      linearProjectUrl: inputData.linearProjectUrl,
      linearTeamUrl: inputData.linearTeamUrl,
      user: {
        connect: {
          id: session.user.id,
        },
      },
    });

    return {
      id: project.id,
      goal: inputData.goal,
      projectName: projectName,
      projectDescription: projectDescription,
    };
  },
});

const draftPRDStep = createStep({
  id: "draft-prd",
  description: "Drafts the first iteration of the PRD for a given project",
  inputSchema: createdProjectSchema,
  outputSchema: draftedPRDSchema,
  execute: async ({ inputData, runtimeContext }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }
    const document = await createDocumentTool.execute({
      runtimeContext,
      context: {
        goal: inputData.goal,
        prd: true,
      },
    });

    return {
      projectId: inputData.id,
      prdId: document.id,
      title: document.title,
      document: document.document,
      projectGoal: inputData.goal,
      projectTitle: inputData.projectName,
    };
  },
});

const draftIssuesStep = createStep({
  id: "draft-prd",
  description:
    "Drafts the first iteration of the issues for a given project, based on the PRD",
  inputSchema: draftedPRDSchema,
  outputSchema: draftedIssuesSchema,
  execute: async ({ inputData, runtimeContext }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    const { document, projectGoal, projectTitle } = inputData;

    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: draftedIssuesSchema,
      prompt: `Based on the following PRD document and project goal, draft a list of issues to be created for the project. 
      \nThe PRD document is: ${document}. 
      \nThe project goal is: ${projectGoal}. 
      \nThe project title is: ${projectTitle}. 
      \nPlease provide a list of issue details. 
      \nThese issues has to be in a modern format, it has to present a real problem/task that needs to be solved, and it has to be concise and clear.
      \nTry not to go beyond 10 issues at the start.`,
    });

    return result.object;
  },
});

const createIssueStep = createStep(createIssueTool);

const finalStep = createStep({
  id: "step-2",
  description: "passes value from input to output",
  inputSchema: createdIssuesSchema,
  outputSchema: createdIssuesSchema,
  execute: async ({ inputData }) => {
    return inputData.map(({ id, title, description }) => ({
      id,
      title,
      description,
    }));
  },
});

const projectWorkflow = createWorkflow({
  id: "project-workflow",
  inputSchema: startProjectWorkflowSchema,
  outputSchema: z.object({
    issues: createdIssuesSchema,
    draftedPRDSchema,
  }),
})
  .then(createProjectStep)
  .then(draftPRDStep)
  .then(draftIssuesStep)
  .foreach(createIssueStep, { concurrency: 3 })
  .then(finalStep)
  .map(async ({ inputData, getStepResult }) => {
    const issues = inputData.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
    }));
    const prevResult = getStepResult(draftPRDStep);
    return {
      issues,
      ...prevResult,
    };
  })
  .commit();

export { projectWorkflow };
