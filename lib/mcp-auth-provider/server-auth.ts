import { auth } from "@modelcontextprotocol/sdk/client/auth.js";
import { ServerOAuthClientProvider } from "./server-provider";
import { NextRequest, NextResponse } from "next/server";

export interface AuthError {
  code: string;
  message: string;
  details?: string;
}

export interface AuthResult {
  success: boolean;
  authUrl?: string;
  error?: AuthError;
}

export class ServerMCPAuth {
  private static readonly LINEAR_MCP_SERVER_URL = "https://mcp.linear.app/mcp";
  private static readonly LINEAR_MCP_CLIENT_NAME = "Linear MCP Server Client";
  private static readonly LINEAR_MCP_CLIENT_URI =
    process.env.NEXTAUTH_URL || "http://localhost:3000";
  private static readonly LINEAR_MCP_CALLBACK_URL = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/linear/callback`;

  static async getProvider(request?: NextRequest): Promise<ServerOAuthClientProvider> {
    return new ServerOAuthClientProvider(
      this.LINEAR_MCP_SERVER_URL,
      {
        storageKeyPrefix: "linear-mcp-auth",
        clientName: this.LINEAR_MCP_CLIENT_NAME,
        clientUri: this.LINEAR_MCP_CLIENT_URI,
        callbackUrl: this.LINEAR_MCP_CALLBACK_URL,
        request,
      }
    );
  }

  /**
   * Initialize authentication
   */
  static async initAuth(request?: NextRequest): Promise<AuthResult> {
    try {
      const provider = await this.getProvider(request);

      // Check if already has valid tokens
      const tokens = await provider.tokens();
      if (tokens && tokens.access_token) {
        return { success: true };
      }

      // Start the auth flow
      const authResult = await auth(provider, {
        serverUrl: this.LINEAR_MCP_SERVER_URL,
      });

      if (authResult === "AUTHORIZED") {
        return { success: true };
      } else if (authResult === "REDIRECT") {
        // Get the authorization URL that was prepared
        const authUrl = await provider.getLastAttemptedAuthUrl();
        if (authUrl) {
          return { success: false, authUrl };
        } else {
          return {
            success: false,
            error: {
              code: "AUTH_URL_NOT_FOUND",
              message: "Authorization URL not found in storage",
            },
          };
        }
      } else {
        return {
          success: false,
          error: {
            code: "AUTH_FAILED",
            message: "Authentication failed with unknown result",
          },
        };
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      return {
        success: false,
        error: {
          code: "INIT_ERROR",
          message: "Failed to initialize authentication",
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Handle the OAuth callback
   */
  static async handleCallback(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        `${baseUrl}/?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || "")}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${baseUrl}/?error=missing_params&description=${encodeURIComponent("Missing authorization code or state")}`
      );
    }

    try {
      // Reconstruct the provider to get stored state
      const provider = await this.getProvider();

      // Get stored state data
      const stateData = await provider.getStoredState(state);
      if (!stateData) {
        return NextResponse.redirect(
          `${baseUrl}/?error=invalid_state&description=${encodeURIComponent("Invalid or expired state parameter")}`
        );
      }

      // The MCP SDK will handle the token exchange automatically
      const authResult = await auth(provider, {
        serverUrl: this.LINEAR_MCP_SERVER_URL,
        authorizationCode: code,
      });

      if (authResult === "AUTHORIZED") {
        return NextResponse.redirect(`${baseUrl}/?success=true`);
      } else {
        return NextResponse.redirect(
          `${baseUrl}/?error=auth_failed&description=${encodeURIComponent("Authentication failed")}`
        );
      }
    } catch (error) {
      console.error("Callback handling error:", error);
      return NextResponse.redirect(
        `${baseUrl}/?error=callback_error&description=${encodeURIComponent("Failed to process callback")}`
      );
    }
  }

  /**
   * Get access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const provider = await this.getProvider();

      const tokens = await provider.tokens();
      return tokens?.access_token || null;
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }

  /**
   * Check if authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  /**
   * Refresh token if needed
   */
  static async refreshTokenIfNeeded(): Promise<string | null> {
    try {
      const provider = await this.getProvider();

      const tokens = await provider.tokens();
      if (!tokens?.refresh_token) {
        return tokens?.access_token || null;
      }

      // Check if token is expired or about to expire (within 5 minutes)
      const expiresAt = tokens.expires_in
        ? Date.now() + tokens.expires_in * 1000
        : 0;
      const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;

      if (expiresAt > fiveMinutesFromNow) {
        return tokens.access_token;
      }

      // Let the MCP SDK handle token refresh
      const authResult = await auth(provider, {
        serverUrl: this.LINEAR_MCP_SERVER_URL,
      });

      if (authResult === "AUTHORIZED") {
        const newTokens = await provider.tokens();
        return newTokens?.access_token || null;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  }

  /**
   * Get auth headers for API requests
   */
  static async getAuthHeaders(): Promise<Record<string, string> | null> {
    const token = await this.refreshTokenIfNeeded();

    if (!token) {
      return null;
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Logout
   */
  static async logout(): Promise<void> {
    try {
      const provider = await this.getProvider();

      await provider.clearStorage();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }
}
