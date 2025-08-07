"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import Link from "next/link";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return (
      <Button
        variant="outline"
        className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
        asChild
      >
        <Link href="/login">Login</Link>
      </Button>
    );
  }

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    setIsLoading(false);
  };

  const getInitials = () => {
    if (user.name) {
      return user.name.split(" ")[0][0] + user.name.split(" ")[1][0];
    } else if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="border border-neutral-200 text-xs bg-neutral-100 shadow-xs size-7 rounded-full items-center justify-center">
          <AvatarFallback className="bg-neutral-100 size-7 rounded-full min-w-6 text-xs font-semibold text-neutral-500 uppercase select-none">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoading}
          className="text-red-600 focus:text-red-600"
        >
          {isLoading ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
