import { auth } from "@/lib/auth";
import { mastra } from "../../../mastra";
import { createLinearMCP } from "../../../mastra/mcps/linear-mcp";
import { ServerMCPAuth } from "@/lib/mcp-auth-provider/server-auth";
import { memory } from "@/mastra/memory";
import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  streamText,
} from "ai";
import z from "zod";
import { projectSchema, teamSchema } from "@/lib/schemas";

const textPartSchema = z.object({
  type: z.enum(["text"]),
  text: z.string().min(1).max(2000),
});

const filePartSchema = z.object({
  type: z.enum(["file"]),
  mediaType: z.enum(["image/jpeg", "image/png"]),
  name: z.string().min(1).max(100),
  url: z.string().url(),
});

const partSchema = z.union([textPartSchema, filePartSchema]);

export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    role: z.enum(["user"]),
    parts: z.array(partSchema),
  }),
  project: projectSchema.optional().nullable(),
  team: teamSchema.optional().nullable(),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;

export async function POST(req: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await req.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    console.log(_);
    return new Response(
      JSON.stringify({
        error: "Request body type is invalid",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { id, message, project, team } = requestBody;
  try {
    // Check if user is authenticated
    const isAuthenticated = await ServerMCPAuth.isAuthenticated();
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!isAuthenticated || !session?.user.id || !id) {
      return new Response(
        JSON.stringify({
          error: "Authentication required",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Create MCP client with OAuth token
    const linearMCP = await createLinearMCP();
    let linearToolsets;
    try {
      linearToolsets = await linearMCP.getToolsets();
    } catch (_) {
      await ServerMCPAuth.refreshTokenIfNeeded();
      return new Response(
        JSON.stringify({
          error: "Authentication to Linear required",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const linearAgent = mastra.getAgent("linearAgent");
    let contextOrientedMessage = message;
    if (!!project || !!team) {
      try {
        await memory.updateWorkingMemory({
          resourceId: session?.user.id ?? "",
          threadId: id,
          workingMemory: `- Current Linear Project Id: ${project?.id ?? ""}\n- Current Linear Team Id: ${team?.id ?? ""}\n- Current Linear Issue ID:`,
        });
        contextOrientedMessage = message;
      } catch (error) {
        contextOrientedMessage = {
          ...message,
          parts: [
            ...message.parts.filter((p) => p.type !== "text"),
            {
              type: "text",
              text: `${message.parts.find((p) => p.type === "text")?.text}.${!!project ? ` Project id: ${project.id}` : ""}${!!team ? ` Team id: ${team.id} ` : ""}`,
            },
          ],
        };
      }
      console.log(contextOrientedMessage);
    }

    const stream = await linearAgent.stream(
      convertToModelMessages([contextOrientedMessage]),
      {
        toolsets: linearToolsets,
        resourceId: session?.user.id ?? "",
        threadId: id,
        abortSignal: req.signal,
        experimental_transform: smoothStream({
          delayInMs: 20, // optional: defaults to 10ms
          chunking: "line", // optional: defaults to 'word'
        }),
        maxSteps: 10,
        // providerOptions: {
        //   google: {
        //     thinkingConfig: {
        //       thinkingBudget: 1024,
        //       includeThoughts: true,
        //     },
        //   },
        // },
      }
    );

    // const res = createUIMessageStream({
    //   execute: async ({ writer: dataStream }) => {
    //     const stream = await linearAgent.stream(message, {
    //       toolsets: await linearMCP.getToolsets(),
    //       resourceId: session?.user.id ?? "",
    //       threadId: id,
    //       abortSignal: req.signal,
    //       experimental_transform: smoothStream({
    //         delayInMs: 20, // optional: defaults to 10ms
    //         chunking: 'line', // optional: defaults to 'word'
    //       }),
    //       providerOptions: {
    //         google: {
    //           thinkingConfig: {
    //             thinkingBudget: 1024,
    //             includeThoughts: true,
    //           },
    //         },
    //       },
    //     });
    //     stream.consumeStream();

    //     dataStream.merge(
    //       stream.toUIMessageStream({
    //         sendReasoning: true,
    //       })
    //     );
    //   },
    // });
    // return new Response(res.pipeThrough(new JsonToSseTransformStream()));
    return stream.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
