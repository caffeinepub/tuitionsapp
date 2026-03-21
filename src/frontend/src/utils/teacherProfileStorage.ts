// Teacher profile storage: profile picture (base64) and awards
// Keyed by teacher principal (Internet Identity principal string)

const PROFILE_KEY = "tuitions_teacher_profiles";

export type TeacherAward = {
  id: string;
  title: string;
  year?: string;
  description?: string;
};

export type TeacherProfile = {
  principal: string;
  profilePicture?: string; // base64 data URL
  awards: TeacherAward[];
  hasTeachedBefore?: boolean;
};

function getAllProfiles(): Record<string, TeacherProfile> {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllProfiles(profiles: Record<string, TeacherProfile>): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
  } catch {
    // ignore
  }
}

export function getTeacherProfile(principal: string): TeacherProfile {
  const all = getAllProfiles();
  return all[principal] ?? { principal, awards: [] };
}

export function saveTeacherProfile(profile: TeacherProfile): void {
  const all = getAllProfiles();
  all[profile.principal] = profile;
  saveAllProfiles(all);
}

export function updateTeacherProfilePicture(
  principal: string,
  dataUrl: string | undefined,
): void {
  const profile = getTeacherProfile(principal);
  profile.profilePicture = dataUrl;
  saveTeacherProfile(profile);
}

export function addTeacherAward(
  principal: string,
  award: Omit<TeacherAward, "id">,
): void {
  const profile = getTeacherProfile(principal);
  profile.awards = [
    { ...award, id: `${Date.now()}_${Math.random().toString(36).slice(2)}` },
    ...profile.awards,
  ];
  saveTeacherProfile(profile);
}

export function removeTeacherAward(principal: string, awardId: string): void {
  const profile = getTeacherProfile(principal);
  profile.awards = profile.awards.filter((a) => a.id !== awardId);
  saveTeacherProfile(profile);
}

// Look up a teacher profile by their display name (for parent dashboard)
// Returns the first profile whose principal matches any stored entry
// Since teacher names are stored in bookings, we need a name->principal map
const NAME_MAP_KEY = "tuitions_teacher_name_map";

export function registerTeacherName(principal: string, name: string): void {
  try {
    const raw = localStorage.getItem(NAME_MAP_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[name.toLowerCase()] = principal;
    localStorage.setItem(NAME_MAP_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getTeacherPrincipalByName(name: string): string | null {
  try {
    const raw = localStorage.getItem(NAME_MAP_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    return map[name.toLowerCase()] ?? null;
  } catch {
    return null;
  }
}

export function getTeacherProfileByName(name: string): TeacherProfile | null {
  const principal = getTeacherPrincipalByName(name);
  if (!principal) return null;
  return getTeacherProfile(principal);
}
