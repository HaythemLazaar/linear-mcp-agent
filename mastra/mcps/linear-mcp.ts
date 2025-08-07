import { MCPClient } from "@mastra/mcp";
import { ServerMCPAuth } from "@/lib/mcp-auth-provider/server-auth";

export const createLinearMCP = async () => {
  const accessToken = await ServerMCPAuth.getAccessToken();

  if (!accessToken) {
    throw new Error(
      "No Linear access token available. Please authenticate first."
    );
  }

  return new MCPClient({
    id: "linear-mcp",
    servers: {
      linear: {
        url: new URL("https://mcp.linear.app/mcp"),
        requestInit: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        sessionId: accessToken,
        eventSourceInit: {
          fetch(input, init) {
            const headers = new Headers(init?.headers || {});
            headers.set("Authorization", `Bearer ${accessToken}`);
            return fetch(input, { ...init, headers });
          },
        },
      },
    },
    timeout: 60000,
  });
};