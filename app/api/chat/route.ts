import { auth } from "@/lib/auth";
import { mastra } from "../../../mastra";
import { createLinearMCP } from "../../../mastra/mcps/linear-mcp";
import { ServerMCPAuth } from "@/lib/mcp-auth-provider/server-auth";

export async function POST(req: Request) {
  const { messages, body } = await req.json();
  const threadId = body?.threadId;
  try {
    // Check if user is authenticated
    const isAuthenticated = await ServerMCPAuth.isAuthenticated();
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!isAuthenticated || !session?.user.id || !threadId) {
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
    const myAgent = mastra.getAgent("linearAgent");
    const stream = await myAgent.stream(messages, {
      toolsets: await linearMCP.getToolsets(),
      resourceId: session?.user.id ?? "",
      threadId: threadId,
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
