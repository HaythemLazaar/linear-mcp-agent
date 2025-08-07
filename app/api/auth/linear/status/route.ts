import { NextRequest, NextResponse } from "next/server";
import { ServerMCPAuth } from "@/lib/mcp-auth-provider/server-auth";

export async function GET(request: NextRequest) {
  try {
    // Check authentication status
    const isAuthenticated = await ServerMCPAuth.isAuthenticated();

    // Get token info if authenticated
    let tokenInfo = null;
    if (isAuthenticated) {
      const token = await ServerMCPAuth.getAccessToken();
      console.log("**********token*********", token);
      if (token) {
        tokenInfo = {
          hasToken: true,
          // Don't expose the actual token in the response
        };
      }
    }

    return NextResponse.json({
      authenticated: isAuthenticated,
      tokenInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Auth status check error:", error);
    return NextResponse.json(
      {
        authenticated: false,
        error: {
          code: "STATUS_CHECK_ERROR",
          message: "Failed to check authentication status",
          details: error instanceof Error ? error.message : String(error),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
