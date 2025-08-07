import type { Metadata } from "next";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/query-client-provider";

export const metadata: Metadata = {
  title: "Linear PRD",
  description: "Product Requirements Document Generator",
};

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cookieStore] = await Promise.all([cookies()]);
  const isCollapsed = cookieStore.get("sidebar:state")?.value !== "true";
  return (
    <QueryProvider>
      <SidebarProvider
        defaultOpen={!isCollapsed}
        className="[--header-height:calc(--spacing(12))] flex flex-col"
      >
        <Header />
        <div className="flex flex-1">
          <AppSidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]! [&>div]:!bg-neutral-50 font-sans border-none pl-1" />
          <SidebarInset className="bg-neutral-50 flex flex-col flex-1 min-h-full">
            {children}
          </SidebarInset>
        </div>
        <Toaster />
      </SidebarProvider>
    </QueryProvider>
  );
}
