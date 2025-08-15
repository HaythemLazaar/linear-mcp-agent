import { auth } from "@/lib/auth";
import { mastra } from "../../../mastra";
import { createLinearMCP } from "../../../mastra/mcps/linear-mcp";
import { ServerMCPAuth } from "@/lib/mcp-auth-provider/server-auth";
import { memory } from "@/mastra/memory";

export async function POST(req: Request) {
  const { id, message, project, team } = await req.json();

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
    console.log("**************TEAM**************", team);
    // Create MCP client with OAuth token
    const linearMCP = await createLinearMCP();
    const linearAgent = mastra.getAgent("linearAgent");
    if (!!project || !!team)
      memory.updateWorkingMemory({
        resourceId: session?.user.id ?? "",
        threadId: id,
        workingMemory: `Current Linear Project Id: ${project?.id ?? ""}\n- Current Linear Team Id: ${team?.id ?? ""}\n- Current Linear Issue ID:`,
      });
    const stream = await linearAgent.stream(message, {
      toolsets: await linearMCP.getToolsets(),
      resourceId: session?.user.id ?? "",
      threadId: id,
    });

    return stream.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
