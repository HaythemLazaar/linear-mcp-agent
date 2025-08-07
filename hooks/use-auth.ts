"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: session } = await authClient.getSession();
      if (session?.user) {
        setUser(session.user as User);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setUser(data.user as User);
        router.push("/");
        return { success: true };
      } else {
        return { success: false, error: "Login failed" };
      }
    } catch (error) {
      return { success: false, error: "An error occurred" };
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      const { data, error } = await authClient.signUp.email({
        email: userData.email,
        password: userData.password,
        name: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}`
          : userData.firstName || userData.lastName || "",
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setUser(data.user as User);
        router.push("/");
        return { success: true };
      } else {
        return { success: false, error: "Signup failed" };
      }
    } catch (error) {
      return { success: false, error: "An error occurred" };
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const googleLogin = async () => {
    try {
      const { data, error } = await authClient.signIn.social({
        provider: "google",
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Handle redirect for OAuth
      if (data && 'url' in data && data.url) {
        window.location.href = data.url;
        return { success: true };
      }

      // Handle successful login
      if (data && 'user' in data && data.user) {
        setUser(data.user as User);
        return { success: true };
      }

      return { success: false, error: "Google login failed" };
    } catch (error) {
      return { success: false, error: "An error occurred" };
    }
  };

  return {
    user,
    loading,
    login,
    signup,
    logout,
    googleLogin,
    checkAuth,
  };
}