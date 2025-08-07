import { NextRequest, NextResponse } from "next/server";
import { ServerMCPAuth } from "@/lib/mcp-auth-provider/server-auth";

export async function POST(request: NextRequest) {
  try {
    // Clear all auth data
    await ServerMCPAuth.logout();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LOGOUT_ERROR",
          message: "Failed to logout",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}
