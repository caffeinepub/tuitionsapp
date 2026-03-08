const STORAGE_KEY = "tuitions_students";
const VERIFICATION_CODES_KEY = "tuitions_verification_codes";
const PARENT_LINKS_KEY = "tuitions_parent_links";

export type StoredStudent = {
  name: string;
  username: string;
  password: string;
};

const DEFAULT_STUDENTS: StoredStudent[] = [
  { name: "Alex Thompson", username: "alex", password: "pass123" },
  { name: "Maya Patel", username: "maya", password: "pass123" },
  { name: "Jordan Lee", username: "jordan", password: "pass123" },
];

export function getStudentUsers(): StoredStudent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with defaults
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STUDENTS));
      return DEFAULT_STUDENTS;
    }
    const stored = JSON.parse(raw) as StoredStudent[];
    // Ensure default demo students are always present so parents can link them
    const storedUsernames = new Set(
      stored.map((u) => u.username.toLowerCase()),
    );
    const missing = DEFAULT_STUDENTS.filter(
      (d) => !storedUsernames.has(d.username.toLowerCase()),
    );
    if (missing.length > 0) {
      const merged = [...missing, ...stored];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return stored;
  } catch {
    return DEFAULT_STUDENTS;
  }
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

export function saveParentLink(principal: string, username: string): void {
  try {
    const raw = localStorage.getItem(PARENT_LINKS_KEY);
    const links: Record<string, string> = raw ? JSON.parse(raw) : {};
    links[principal] = username.toLowerCase();
    localStorage.setItem(PARENT_LINKS_KEY, JSON.stringify(links));
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
