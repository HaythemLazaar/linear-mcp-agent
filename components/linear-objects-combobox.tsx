"use client";

import * as React from "react";
import { Check, Plus } from "lucide-react";

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
import { TbCube, TbUserSquare } from "react-icons/tb";
import { projectsSchema, teamsSchema } from "@/lib/schemas";
import { LinearProject, LinearTeam } from "@/lib/types";
import { useLinearOjects } from "@/hooks/use-linear-objects";

export function LinearObjectsCombobox() {
  const { project, team, setProject, setTeam } = useLinearOjects();
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
          <Button variant="ghost" size="sm">
            <Plus />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 text-[13px]">
                <TbCube className="size-3.5 text-neutral-500" /> Team
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
                            <TbCube className="size-3.5 -mt-px text-neutral-500" />{" "}
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
              <DropdownMenuSubTrigger className="gap-2 text-[13px]">
                <TbCube className="size-3.5 text-neutral-500" /> Project
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
        <span className="bg-primary text-primary-foreground mr-2 rounded-lg px-2 py-1 text-xs">
          {project.name}
        </span>
      )}
      {!!team && (
        <span className="bg-primary text-primary-foreground mr-2 rounded-lg px-2 py-1 text-xs">
          {team.name}
        </span>
      )}
    </div>
  );
}
