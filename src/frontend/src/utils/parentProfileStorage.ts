// Registry of all parents who have logged in to Tuition Skill.
// Saved on every parent login so Admin can see all registered parents.

const PARENT_PROFILES_KEY = "tuitions_parent_profiles";

export type ParentProfile = {
  principal: string;
  name: string; // "Parent of {studentName}" or Internet Identity principal short
  joinedAt: number;
  linkedStudents: string[]; // student usernames
};

function getAllParentProfiles(): ParentProfile[] {
  try {
    const raw = localStorage.getItem(PARENT_PROFILES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ParentProfile[];
  } catch {
    return [];
  }
}

function saveAllParentProfiles(profiles: ParentProfile[]): void {
  localStorage.setItem(PARENT_PROFILES_KEY, JSON.stringify(profiles));
}

export function upsertParentProfile(
  principal: string,
  linkedStudents?: string[],
  name?: string,
): void {
  const all = getAllParentProfiles();
  const idx = all.findIndex((p) => p.principal === principal);
  if (idx === -1) {
    all.push({
      principal,
      name: name ?? `Parent (${principal.slice(0, 8)}…)`,
      joinedAt: Date.now(),
      linkedStudents: linkedStudents ?? [],
    });
  } else {
    all[idx] = {
      ...all[idx],
      linkedStudents: linkedStudents ?? all[idx].linkedStudents,
      name: name ?? all[idx].name,
    };
  }
  saveAllParentProfiles(all);
}

export function getParentProfile(principal: string): ParentProfile | null {
  return getAllParentProfiles().find((p) => p.principal === principal) ?? null;
}

export function getAllRegisteredParents(): ParentProfile[] {
  return getAllParentProfiles();
}

export function deleteParentProfile(principal: string): void {
  saveAllParentProfiles(
    getAllParentProfiles().filter((p) => p.principal !== principal),
  );
}
