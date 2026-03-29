const STORAGE_KEY = "tuitions_students";
const VERIFICATION_CODES_KEY = "tuitions_verification_codes";
const PARENT_LINKS_KEY = "tuitions_parent_links";
const PARENT_LINK_NAMES_KEY = "tuitions_parent_link_names";

export type StoredStudent = {
  name: string;
  username: string;
  password: string;
  dob?: string; // ISO date string e.g. "2005-03-15"
  isBanned?: boolean;
};

export function getStudentUsers(): StoredStudent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as StoredStudent[];
  } catch {
    return [];
  }
}

/** Returns age in years for a stored student, or null if no dob recorded. */
export function getStudentAge(username: string): number | null {
  const users = getStudentUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase(),
  );
  if (!user?.dob) return null;
  const dob = new Date(user.dob);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// ---- Verification codes ----

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function getOrCreateVerificationCode(username: string): string {
  try {
    const raw = localStorage.getItem(VERIFICATION_CODES_KEY);
    const codes: Record<string, string> = raw ? JSON.parse(raw) : {};
    const key = username.toLowerCase();
    if (!codes[key]) {
      codes[key] = generateCode();
      localStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(codes));
    }
    return codes[key];
  } catch {
    return generateCode();
  }
}

export function verifyStudentCode(username: string, code: string): boolean {
  try {
    const raw = localStorage.getItem(VERIFICATION_CODES_KEY);
    const codes: Record<string, string> = raw ? JSON.parse(raw) : {};
    return codes[username.toLowerCase()] === code.trim();
  } catch {
    return false;
  }
}

// ---- Parent-student links ----

export function getParentLink(principal: string): string | null {
  try {
    const raw = localStorage.getItem(PARENT_LINKS_KEY);
    const links: Record<string, string> = raw ? JSON.parse(raw) : {};
    return links[principal] ?? null;
  } catch {
    return null;
  }
}

export function getParentLinkName(principal: string): string | null {
  try {
    const raw = localStorage.getItem(PARENT_LINK_NAMES_KEY);
    const names: Record<string, string> = raw ? JSON.parse(raw) : {};
    return names[principal] ?? null;
  } catch {
    return null;
  }
}

export function saveParentLink(
  principal: string,
  username: string,
  studentName?: string,
): void {
  try {
    const raw = localStorage.getItem(PARENT_LINKS_KEY);
    const links: Record<string, string> = raw ? JSON.parse(raw) : {};
    links[principal] = username.toLowerCase();
    localStorage.setItem(PARENT_LINKS_KEY, JSON.stringify(links));

    // Also cache the student's display name so we can restore it on re-login
    if (studentName) {
      const namesRaw = localStorage.getItem(PARENT_LINK_NAMES_KEY);
      const names: Record<string, string> = namesRaw
        ? JSON.parse(namesRaw)
        : {};
      names[principal] = studentName;
      localStorage.setItem(PARENT_LINK_NAMES_KEY, JSON.stringify(names));
    }
  } catch {
    // ignore
  }
}

// ---- Password reset ----

export function resetStudentPassword(
  username: string,
  newPassword: string,
): { success: boolean; message: string } {
  const users = getStudentUsers();
  const idx = users.findIndex(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase(),
  );
  if (idx === -1) {
    return { success: false, message: "No student found with that username." };
  }
  users[idx] = { ...users[idx], password: newPassword };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return { success: true, message: "Password reset successfully." };
}

// ---- Student CRUD ----

export function saveStudentUser(student: StoredStudent): {
  success: boolean;
  message: string;
} {
  const users = getStudentUsers();
  const exists = users.some(
    (u) => u.username.toLowerCase() === student.username.toLowerCase(),
  );
  if (exists) {
    return {
      success: false,
      message: "Username already taken. Please choose another.",
    };
  }
  users.push(student);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return { success: true, message: "Registration successful!" };
}

// ---- Ban/Unban ----

export function banStudent(username: string): void {
  const users = getStudentUsers();
  const idx = users.findIndex(
    (u) => u.username.toLowerCase() === username.toLowerCase(),
  );
  if (idx >= 0) {
    users[idx] = { ...users[idx], isBanned: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
}

export function unbanStudent(username: string): void {
  const users = getStudentUsers();
  const idx = users.findIndex(
    (u) => u.username.toLowerCase() === username.toLowerCase(),
  );
  if (idx >= 0) {
    users[idx] = { ...users[idx], isBanned: false };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
}

export function isStudentBanned(username: string): boolean {
  const users = getStudentUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase(),
  );
  return user?.isBanned === true;
}
