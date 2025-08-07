"use client";
import { TbSearch, TbSmartHome } from "react-icons/tb";
import { SidebarTrigger } from "./ui/sidebar";
import { UserMenu } from "./user-menu";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import { RxSlash } from "react-icons/rx";
import { BsReverseLayoutTextSidebarReverse } from "react-icons/bs";
import { CheckCircle, ChevronDown } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { FaCircleCheck } from "react-icons/fa6";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { getThread } from "@/lib/ai/threads";
import { getProject } from "@/lib/db/queries";

export function Header() {
  const pathname = usePathname();
  const { id } = useParams<{ id: string }>();
  const isProjectPage = pathname.startsWith("/projects/");
  const [storedLayout, setStoredLayout] = useLocalStorage<
    "chat" | "project" | "reverse" | "default"
  >("project-layout", "default");

  const { data: thread, isLoading: isThreadLoading } = useQuery({
    queryKey: ["thread", id],
    queryFn: () => getThread(id),
    enabled: isProjectPage
  });

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id),
    enabled: isProjectPage
  });

  const isLoadingTitle = isProjectLoading || isThreadLoading

  if (isProjectPage) {
    return (
      <header className="h-12 max-w-screen bg-neutral-50 sticky top-0 z-50 flex items-center px-3">
        <Button variant="ghost" asChild>
          <Link href="/">
            <TbSmartHome strokeWidth={2} className="size-5" />
          </Link>
        </Button>
        <RxSlash className="size-4 text-neutral-500" />
        <Button variant="ghost" asChild>
          <Link href="/projects">Projects</Link>
        </Button>
        <RxSlash className="size-4 text-neutral-500" />
        <Button variant="ghost" className={cn({
          'w-20 bg-neutral-200 animate-pulse' : isLoadingTitle
        })}>
          {isLoadingTitle ? "" : project?.name || thread?.title || "Not Found"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-auto gap-1 text-neutral-500">
              <BsReverseLayoutTextSidebarReverse className="size-4 bg-neutral-100" />
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="grid grid-cols-2" align="end">
            {LAYOUTS.map((layout) => (
              <DropdownMenuItem
                key={layout.value}
                onSelect={() => setStoredLayout(layout.value)}
                data-selected={storedLayout === layout.value}
                inset
                className={cn(
                  "w-33 !p-2 relative focus:bg-transparent group/layout-item",
                  storedLayout === layout.value && "**:border-indigo-300 "
                )}
              >
                <Tooltip>
                  <TooltipTrigger className="w-full">
                    {layout.icon}
                  </TooltipTrigger>
                  <TooltipContent>{layout.name}</TooltipContent>
                </Tooltip>
                {storedLayout === layout.value && (
                  <FaCircleCheck className="absolute top-1 right-1" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    );
  }
  return (
    <header className="h-12 max-w-screen bg-neutral-50 sticky top-0 z-50">
      <div className="flex items-center h-full px-3 w-full">
        <div className="flex items-center gap-2 flex-1">
          <SidebarTrigger />
        </div>
        <div className="border border-neutral-200 rounded-md flex items-center gap-2 p-1.5 h-7 bg-neutral-100 shadow-[0_0_0.5px_0.5px_rgba(0,0,0,0.01)] min-w-102 text-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer">
          <TbSearch className="size-3.5 text-neutral-600" />
          <span className="text-neutral-400 tracking-normal font-normal">
            Search
          </span>
        </div>
        <div className="flex gap-2 flex-1 justify-end">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

const LAYOUTS: {
  name: string;
  value: "chat" | "project" | "reverse" | "default";
  icon: React.ReactNode;
}[] = [
  {
    name: "Default",
    value: "default",
    icon: (
      <div className="grid grid-cols-3 h-20 w-full gap-1.5">
        <div className="rounded-s-md rounded-e border border-neutral-300 col-span-1 group-data-[selected=true]/layout-item:bg-indigo-50 group-focus/layout-item:bg-neutral-50 transition-all" />
        <div className="flex flex-col gap-0.5 p-2 justify-center rounded-e-md rounded-s border border-neutral-300 col-span-2 group-data-[selected=true]/layout-item:bg-indigo-50 group-data-[selected=true]/layout-item:**:bg-indigo-200 group-focus/layout-item:**:bg-neutral-300 group-focus/layout-item:bg-neutral-50 transition-all">
          <div className="rounded-xs w-1/2 h-1 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-1/3 h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-1/3 h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-2 my-1 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
        </div>
      </div>
    ),
  },
  {
    name: "Reverse",
    value: "reverse",
    icon: (
      <div className="grid grid-cols-3 h-20 w-full gap-1.5">
        <div className="flex flex-col gap-0.5 p-2 justify-center rounded-s-md rounded-e border border-neutral-300 col-span-2 group-data-[selected=true]/layout-item:bg-indigo-50 group-data-[selected=true]/layout-item:**:bg-indigo-200 group-focus/layout-item:**:bg-neutral-300 group-focus/layout-item:bg-neutral-50 transition-all">
          <div className="rounded-xs w-1/2 h-1 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-1/3 h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-1/3 h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-2 my-1 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
        </div>
        <div className="rounded-e-md rounded-s border border-neutral-300 col-span-1 group-data-[selected=true]/layout-item:bg-indigo-50 group-focus/layout-item:bg-neutral-50 transition-all" />
      </div>
    ),
  },
  {
    name: "Project only",
    value: "project",
    icon: (
      <div className="h-20 w-full flex justify-center rounded border border-neutral-300 group-focus/layout-item:bg-neutral-50 transition-all group-data-[selected=true]/layout-item:bg-indigo-50">
        <div className="flex flex-col gap-0.5 p-2 justify-center col-span-2 w-18 group-data-[selected=true]/layout-item:**:bg-indigo-200 group-focus/layout-item:**:bg-neutral-300 transition-all">
          <div className="rounded-xs w-1/2 h-1 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-1/3 h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-1/3 h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-2 my-1 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
          <div className="rounded-xs w-full h-0.5 bg-neutral-200" />
        </div>
      </div>
    ),
  },
  {
    name: "Chat only",
    value: "chat",
    icon: (
      <div className="h-20 w-full flex justify-center rounded border border-neutral-300 group-focus/layout-item:bg-neutral-50 transition-all group-data-[selected=true]/layout-item:bg-indigo-50">
        <div className="flex flex-col gap-0.5 p-2 justify-center col-span-2 w-18 group-data-[selected=true]/layout-item:**:bg-indigo-200 group-focus/layout-item:**:bg-neutral-300  transition-all">
          <div className="rounded-xs w-1/3 h-0.5 bg-neutral-200 ml-auto mr-0.5" />
          <div className="rounded-xs max-w-full h-0.5 bg-neutral-200 mx-0.5" />
          <div className="rounded-xs max-w-full h-0.5 bg-neutral-200 mx-0.5" />
          <div className="rounded-xs max-w-full h-0.5 bg-neutral-200 mx-0.5" />
          <div className="rounded-xs max-w-full h-0.5 bg-neutral-200 mx-0.5" />
          <div className="rounded-xs w-1/3 h-0.5 bg-neutral-200 ml-auto mr-0.5 mt-1" />
          <div className="rounded-xs max-w-full h-0.5 bg-neutral-200 mx-0.5" />
          <div className="rounded-xs max-w-full h-0.5 bg-neutral-200 mx-0.5" />
          <div className="w-full mt-auto rounded h-4 border border-neutral-200" />
        </div>
      </div>
    ),
  },
];
