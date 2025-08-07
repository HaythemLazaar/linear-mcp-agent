import { NextRequest, NextResponse } from "next/server";
import { ServerMCPAuth } from "@/lib/mcp-auth-provider/server-auth";

export async function POST(request: NextRequest) {
  try {
    // Attempt to refresh token
    const newToken = await ServerMCPAuth.refreshTokenIfNeeded();

    if (newToken) {
      return NextResponse.json({
        success: true,
        message: "Token refreshed successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REFRESH_FAILED",
            message: "No valid token available or refresh failed",
          },
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REFRESH_ERROR",
          message: "Token refresh failed",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}
