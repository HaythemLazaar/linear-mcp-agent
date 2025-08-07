"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SiLinear } from "react-icons/si";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LinearAuthProps {
  onAuthSuccess?: () => void;
  onAuthError?: (error: string) => void;
}

export function LinearAuth({ onAuthSuccess, onAuthError }: LinearAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/linear/status");
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        toast.success("Logged in successfully");
      } else {
        toast.error("Failed to login");
      }
    } catch (error) {
      toast.error("Failed to check auth status");
      console.error("Failed to check auth status:", error);
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Redirect to Linear OAuth
      window.location.href = "/api/auth/linear?action=login";
    } catch (error) {
      toast.error("Failed to initiate login");
      setError("Failed to initiate login");
      onAuthError?.("Failed to initiate login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/linear/logout", {
        method: "POST",
      });

      if (response.ok) {
        setIsAuthenticated(false);
        toast.success("Logged out successfully");
        onAuthSuccess?.();
      } else {
        toast.error("Failed to logout");
        setError("Failed to logout");
      }
    } catch (error) {
      toast.error("Failed to logout");
      setError("Failed to logout");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="w-full flex items-center gap-1 px-2 pb-2 pt-1">
        <Loader2 className="size-3.5 animate-spin text-neutral-500" />
        <span className={cn("text-xs font-semibold text-neutral-500")}>
          {isAuthenticated ? "Logging out..." : "Logging in..."}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center gap-1 px-2 pb-2 pt-1">
      {isLoading ? (
        <>
          <Loader2 className="size-3.5 animate-spin text-neutral-500" />
          <span className={cn("text-xs font-semibold text-neutral-500")}>
            {isAuthenticated ? "Logging out..." : "Logging in..."}
          </span>
        </>
      ) : (
        <>
          <SiLinear
            className={cn(
              "size-3.5",
              isAuthenticated ? "text-indigo-500" : "text-red-500"
            )}
          />
          <span
            className={cn(
              "text-xs font-semibold",
              isAuthenticated ? "text-indigo-500" : "text-red-500"
            )}
          >
            {isAuthenticated
              ? "Connected to Linear"
              : "Not Connected to Linear"}
          </span>
        </>
      )}

      <div className="ml-auto">
        {!isAuthenticated ? (
          <button
            className="text-xs font-semibold text-neutral-500"
            onClick={handleLogin}
            disabled={isLoading}
          >
            Connect
          </button>
        ) : (
          <button
            className="text-xs font-semibold text-neutral-500"
            onClick={handleLogout}
            disabled={isLoading}
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
