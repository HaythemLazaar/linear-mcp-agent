"use client";
import { TbLayoutSidebarFilled } from "react-icons/tb";
import { SidebarTrigger } from "./ui/sidebar";
import { UserMenu } from "./user-menu";

export function Header() {
  return (
    <header className="h-12 max-w-screen bg-neutral-50 sticky top-0 z-50">
      <div className="flex items-center h-full px-3 w-full">
        <div className="flex items-center gap-2 flex-1">
          <SidebarTrigger>
            <TbLayoutSidebarFilled className="size-5 scale-x-[1.2] text-neutral-700" />
          </SidebarTrigger>
        </div>
        <div className="flex gap-2 flex-1 justify-end">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
