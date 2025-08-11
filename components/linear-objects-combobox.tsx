"use client";

import * as React from "react";
import { Check, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import z from "zod";
import { useQuery } from "@tanstack/react-query";
import { TbCube, TbUserPentagon } from "react-icons/tb";
import { projectsSchema, teamsSchema } from "@/lib/schemas";
import { LinearProject, LinearTeam } from "@/lib/types";
import { useLinearObjects } from "@/hooks/use-linear-objects";
import { BiLoaderCircle, BiSolidRightArrow } from "react-icons/bi";
import { MdOutlineError } from "react-icons/md";
import { cn } from "@/lib/utils";

export function LinearObjectsCombobox() {
  const { project, team, setProject, setTeam } = useLinearObjects();
  const [open, setOpen] = React.useState(false);
  const {
    data: teams,
    isLoading: isTeamsLoading,
    isError: teamsError,
  } = useQuery<z.infer<typeof teamsSchema>>({
    queryKey: ["teams"],
    queryFn: () =>
      fetch("/api/linear/teams").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch teams");
        return res.json();
      }),
  });
  const {
    data: projects,
    isLoading: isProjectsLoading,
    isError: projectsError,
  } = useQuery<z.infer<typeof projectsSchema>>({
    queryKey: ["projects"],
    queryFn: () =>
      fetch("/api/linear/projects").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch projects");
        return res.json();
      }),
  });

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-6 rounded-sm font-normal tracking-normal text-xs !px-2 text-neutral-800 gap-1 border-neutral-300"
          >
            <Plus className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className={cn("gap-2 text-[13px]", {
                  "*:last:ml-0": teamsError,
                })}
                ArrowIcon={
                  isTeamsLoading
                    ? BiLoaderCircle
                    : teamsError
                      ? MdOutlineError
                      : BiSolidRightArrow
                }
                disabled={isTeamsLoading || teamsError}
                arrowIconClassName={
                  isTeamsLoading
                    ? "size-3 animate-spin"
                    : teamsError
                      ? "size-4 text-red-500"
                      : ""
                }
              >
                <TbUserPentagon className="size-3.5 text-neutral-500" /> Team{" "}
                {teamsError && (
                  <span className="text-neutral-500 text-xs ml-auto">
                    Error
                  </span>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-0">
                <Command>
                  <CommandInput
                    placeholder="Filter team..."
                    autoFocus={true}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No team found.</CommandEmpty>
                    <CommandGroup>
                      {!teamsError &&
                        !isTeamsLoading &&
                        teams?.teams.map((t: LinearTeam) => (
                          <CommandItem
                            key={t.id}
                            value={t.name}
                            onSelect={() => {
                              const selectedTeam = teams.teams.find(
                                (te) => te.id === t.id
                              );
                              setTeam(selectedTeam!);
                              setOpen(false);
                            }}
                            className="text-[13px]"
                          >
                            <TbUserPentagon className="size-3.5 -mt-px text-neutral-500" />{" "}
                            {t.name}
                            {team && t.id === team.id && (
                              <Check className="ml-auto" />
                            )}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className={cn("gap-2 text-[13px]", {
                  "*:last:ml-0": projectsError,
                })}
                ArrowIcon={
                  isProjectsLoading
                    ? BiLoaderCircle
                    : projectsError
                      ? MdOutlineError
                      : BiSolidRightArrow
                }
                arrowIconClassName={
                  isProjectsLoading
                    ? "size-3 animate-spin"
                    : projectsError
                      ? "size-4 text-red-500"
                      : ""
                }
                disabled={isProjectsLoading || projectsError}
              >
                <TbCube className="size-3.5 text-neutral-500" /> Project{" "}
                {projectsError && (
                  <span className="text-neutral-500 text-xs -mb-0.5 ml-auto">
                    Error
                  </span>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-0">
                <Command>
                  <CommandInput
                    placeholder="Filter project..."
                    autoFocus={true}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No project found.</CommandEmpty>
                    <CommandGroup>
                      {!projectsError &&
                        !isProjectsLoading &&
                        projects?.projects.map((p: LinearProject) => (
                          <CommandItem
                            key={p.id}
                            value={p.name}
                            onSelect={() => {
                              const selectedProject = projects.projects.find(
                                (pr) => pr.id === p.id
                              );
                              setProject(selectedProject!);
                              setOpen(false);
                            }}
                            className="text-[13px]"
                          >
                            <TbCube className="size-3.5 -mt-px text-neutral-500" />{" "}
                            {p.name}
                            {project && p.id === project.id && (
                              <Check className="ml-auto" />
                            )}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {!!project && (
        <Button
          variant="outline"
          className="h-6 rounded-sm font-normal tracking-normal text-xs !px-2 text-neutral-800 gap-1 border-neutral-300 group/selected relative overflow-hidden"
        >
          <TbCube className="size-3 text-neutral-500" />
          <span className="max-w-30 text-ellipsis overflow-hidden">
            {project.name}
          </span>
          <span className="absolute group-hover/selected:opacity-100 opacity-0 transition-all right-0  px-1 h-full top-0 flex items-center justify-center" onClick={() => setProject(null)}>
            <X className="size-3 bg-white"/>
          </span>
        </Button>
      )}
      {!!team && (
        <Button
          variant="outline"
          className="h-6 rounded-sm font-normal tracking-normal text-xs !px-2 text-neutral-800 gap-1 border-neutral-300 group/selected relative overflow-hidden"
        >
          <TbUserPentagon className="size-3 text-neutral-500" />
          <span className="max-w-30 text-ellipsis overflow-hidden">
            {team.name}
          </span>
          <span className="absolute group-hover/selected:opacity-100 opacity-0 transition-all right-0  px-1 h-full top-0 flex items-center justify-center" onClick={() => setTeam(null)}>
            <X className="size-3 bg-white"/>
          </span>
        </Button>
      )}
    </div>
  );
}
