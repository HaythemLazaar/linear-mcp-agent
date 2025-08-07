import { NextRequest, NextResponse } from "next/server";
import { ServerMCPAuth } from "@/lib/mcp-auth-provider/server-auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "login") {
    try {
      // Initialize authentication
      const authResult = await ServerMCPAuth.initAuth(request);

      if (authResult.success) {
        return NextResponse.json({
          success: true,
          message: "Already authenticated",
        });
      } else if (authResult.authUrl) {
        // Redirect to authorization URL
        return NextResponse.redirect(authResult.authUrl);
      } else {
        return NextResponse.json(
          {
            success: false,
            error: authResult.error,
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Auth login error:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "LOGIN_ERROR",
            message: "Failed to initiate login",
            details: error instanceof Error ? error.message : String(error),
          },
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INVALID_ACTION",
        message: "Invalid action specified",
      },
    },
    { status: 400 }
  );
}
