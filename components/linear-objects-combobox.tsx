"use client";

import * as React from "react";
import { Plus } from "lucide-react";

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
import { TbUserSquare } from "react-icons/tb";
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
              <DropdownMenuSubTrigger>Team</DropdownMenuSubTrigger>
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
                        teams?.teams.map((team: LinearTeam) => (
                          <CommandItem
                            key={team.id}
                            value={team.id}
                            onSelect={(value) => {
                              const selectedTeam = teams.teams.find(
                                (t) => t.id === value
                              );
                              setTeam(selectedTeam!);
                              setOpen(false);
                            }}
                          >
                            {team.name}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Project</DropdownMenuSubTrigger>
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
                        projects?.projects.map((project: LinearProject) => (
                          <CommandItem
                            key={project.id}
                            value={project.id}
                            onSelect={(value) => {
                              const selectedProject = projects.projects.find(
                                (p) => p.id === value
                              );
                              setProject(selectedProject!);
                              setOpen(false);
                            }}
                          >
                            <TbUserSquare className="size-4 text-neutral-500" />{" "}
                            {project.name}
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

