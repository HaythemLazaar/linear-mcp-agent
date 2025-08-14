import { LinearProject, LinearTeam } from "@/lib/types";
import { useLocalStorage } from "usehooks-ts";

function useLinearObjects() {
  const [project, setProject] = useLocalStorage<LinearProject | null>('linearProjectId', null);
  const [team, setTeam] = useLocalStorage<LinearTeam | null>('linearTeamId', null);

  return {
    project,
    team,
    setProject,
    setTeam,
  };
}

export { useLinearObjects };
