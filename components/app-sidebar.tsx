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
import { TbCube, TbFileSmile, TbSmartHome } from "react-icons/tb";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isProjects = pathname === "/projects";
  const isDocuments = pathname === "/documents";
  const { user } = useAuth();
  const { data: threads } = useQuery({
    queryKey: ["threads"],
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
              isProjects && "bg-neutral-200/50 text-neutral-900"
            )}
            asChild
          >
            <Link href="/projects">
              <TbCube strokeWidth={1.5} />
              Projects
            </Link>
          </SidebarMenuButton>
          <SidebarMenuButton
            className={cn(
              "text-neutral-700 font-medium hover:bg-neutral-200/50",
              isDocuments && "bg-neutral-200/50 text-neutral-900"
            )}
            asChild
          >
            <Link href="/documents">
              <TbFileSmile strokeWidth={1.5} />
              Documents
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
                pathname === `/projects/${thread.id}` &&
                  "bg-neutral-200/50 text-neutral-900"
              )}
              asChild
            >
              <Link href={`/projects/${thread.id}`}>
                {thread.title || "Untitled Thread"}
              </Link>
            </SidebarMenuButton>
          ))}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
