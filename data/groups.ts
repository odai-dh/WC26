import type { Group, GroupId } from "@/types/tournament";
import { TEAMS } from "./teams";

export const GROUP_IDS: GroupId[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

export const GROUPS: Group[] = GROUP_IDS.map((id) => ({
  id,
  teamIds: TEAMS.filter((t) => t.group === id)
    .sort((a, b) => a.seeding - b.seeding)
    .map((t) => t.id),
}));

export const GROUPS_BY_ID: Record<GroupId, Group> = Object.fromEntries(
  GROUPS.map((g) => [g.id, g]),
) as Record<GroupId, Group>;
