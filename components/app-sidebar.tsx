"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { getUserThreads } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TbCube, TbSmartHome } from "react-icons/tb";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isChats = pathname === "/chats";
  const { user } = useAuth();
  const { data: threads } = useQuery({
    queryKey: ["threads", user?.id],
    queryFn: () => getUserThreads(user?.id || ""),
    enabled: !!user?.id,
  });
  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenuButton
            className={cn(
              "text-neutral-700 font-medium hover:bg-neutral-200/50",
              isHome && "bg-neutral-200/50 text-neutral-900"
            )}
            asChild
          >
            <Link href="/">
              <TbSmartHome strokeWidth={1.5} />
              Home
            </Link>
          </SidebarMenuButton>
          <SidebarMenuButton
            className={cn(
              "text-neutral-700 font-medium hover:bg-neutral-200/50",
              isChats && "bg-neutral-200/50 text-neutral-900"
            )}
            asChild
          >
            <Link href="/chats">
              <TbCube strokeWidth={1.5} />
              Chats
            </Link>
          </SidebarMenuButton>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Recents</SidebarGroupLabel>
          {threads?.map((thread) => (
            <SidebarMenuButton
              key={thread.id}
              className={cn(
                "text-neutral-700 font-medium hover:bg-neutral-200/50",
                pathname === `/chat/${thread.id}` &&
                  "bg-neutral-200/50 text-neutral-900"
              )}
              asChild
            >
              <Link href={`/chat/${thread.id}`}>
                {thread.title || "Untitled Thread"}
              </Link>
            </SidebarMenuButton>
          ))}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
