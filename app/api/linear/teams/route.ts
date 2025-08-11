import { auth } from "@/lib/auth";
import { ServerMCPAuth } from "@/lib/mcp-auth-provider/server-auth";
import { mastra } from "@/mastra";
import { createLinearMCP } from "@/mastra/mcps/linear-mcp";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import z from "zod";

export async function GET(req: Request) {
  try {
    // Check if user is authenticated
    const isAuthenticated = await ServerMCPAuth.isAuthenticated();
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!isAuthenticated || !session?.user.id) {
      return new Response(
        JSON.stringify({
          error: "Authentication required",
          authUrl: "/api/auth/linear?action=login",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // TODO: To transform this into a workflow
    const linearMCP = await createLinearMCP();
    const myAgent = mastra.getAgent("linearAgent");
    const teams = await myAgent.generate(
      "list all the teams from linear and use list_teams tool from the connected linear MCP tools. Ensure that the returned object is an array of the teams, with all their details.",
      {
        toolsets: await linearMCP.getToolsets(),
      }
    );

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        teams: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
          })
        ),
      }),
      system:
        'You will take the input which is a text and you will return it as an object with a "teams" property that is an array of team objects.',
      prompt: `take the following text and return it as an object with a "teams" property that is an array of team objects: ${teams.text}`,
    });

    return new Response(JSON.stringify(object), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return new Response(`Error fetching teams`, {
      status: 500,
    });
  }
}
