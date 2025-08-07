import { NextRequest } from "next/server";
import { ServerMCPAuth } from "@/lib/mcp-auth-provider/server-auth";

export async function GET(request: NextRequest) {
  return await ServerMCPAuth.handleCallback(request);
}
