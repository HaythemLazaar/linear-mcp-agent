import { LinearProject, LinearTeam } from "@/lib/types";
import { useState } from "react";

function useLinearObjects() {
  const [project, setProject] = useState<LinearProject | null>(null);
  const [team, setTeam] = useState<LinearTeam | null>(null);

  return {
    project,
    team,
    setProject,
    setTeam,
  };
}

export { useLinearObjects };
