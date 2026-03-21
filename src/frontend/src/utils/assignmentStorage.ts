// Shared storage for assignments (teacher creates, student reads)
// and call bookings (student creates, teacher grades)

const ASSIGNMENTS_KEY = "tuitions_assignments";
const BOOKINGS_KEY = "tuitions_call_bookings";
const GRADES_KEY = "tuitions_grades";
const SESSIONS_KEY = "tuitions_scheduled_sessions";

// ---- Types ----

export type Assignment = {
  id: string;
  title: string;
  subject: string;
  due: string;
  teacherName: string;
  createdAt: number;
};

export type CallBooking = {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  subject: string;
  teacherName: string;
  studentUsername: string;
  studentName: string;
  callType: "Video" | "Audio";
  date: string;
  time: string;
  status: "pending" | "completed";
  createdAt: number;
};

export type Grade = {
  id: string;
  bookingId: string;
  assignmentId: string;
  assignmentTitle: string;
  studentUsername: string;
  studentName: string;
  teacherName: string;
  subject: string;
  grade: string;
  feedback: string;
  gradedAt: number;
};

export type ScheduledSession = {
  id: string;
  teacherName: string;
  subject: string;
  date: string;
  time: string;
  notes: string;
  createdAt: number;
};

// ---- Assignments ----

export function getAssignments(): Assignment[] {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Assignment[];
  } catch {
    return [];
  }
}

export function saveAssignment(a: Assignment): void {
  const list = getAssignments();
  list.unshift(a);
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(list));
}

export function deleteAssignment(id: string): void {
  const list = getAssignments().filter((a) => a.id !== id);
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(list));
}

// ---- Call Bookings ----

export function getCallBookings(): CallBooking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CallBooking[];
  } catch {
    return [];
  }
}

export function saveCallBooking(b: CallBooking): void {
  const list = getCallBookings();
  list.unshift(b);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
}

export function markBookingCompleted(id: string): void {
  const list = getCallBookings().map((b) =>
    b.id === id ? { ...b, status: "completed" as const } : b,
  );
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
}

export function getBookingsForStudent(username: string): CallBooking[] {
  return getCallBookings().filter(
    (b) => b.studentUsername.toLowerCase() === username.toLowerCase(),
  );
}

// ---- Grades ----

export function getGrades(): Grade[] {
  try {
    const raw = localStorage.getItem(GRADES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Grade[];
  } catch {
    return [];
  }
}

export function saveGrade(g: Grade): void {
  const list = getGrades();
  // replace if same bookingId already graded
  const idx = list.findIndex((x) => x.bookingId === g.bookingId);
  if (idx >= 0) {
    list[idx] = g;
  } else {
    list.unshift(g);
  }
  localStorage.setItem(GRADES_KEY, JSON.stringify(list));
}

export function getGradesForStudent(username: string): Grade[] {
  return getGrades().filter(
    (g) => g.studentUsername.toLowerCase() === username.toLowerCase(),
  );
}

// ---- Chat Messages ----

export type ChatMessage = {
  id: string;
  bookingId: string;
  senderRole: "student" | "teacher" | "parent";
  senderName: string;
  text: string;
  sentAt: number;
};

const CHAT_KEY = "tuitions_chat_messages";

export function getChatMessages(bookingId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as ChatMessage[];
    return all.filter((m) => m.bookingId === bookingId);
  } catch {
    return [];
  }
}

export function saveChatMessage(msg: ChatMessage): void {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    const all: ChatMessage[] = raw ? JSON.parse(raw) : [];
    all.push(msg);
    localStorage.setItem(CHAT_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

// Track last-read timestamp per booking per role ("teacher" | "student" | "parent")
const CHAT_READ_KEY = "tuitions_chat_read";

function getChatReadMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(CHAT_READ_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function markChatRead(
  bookingId: string,
  role: "teacher" | "student" | "parent",
): void {
  try {
    const map = getChatReadMap();
    map[`${role}_${bookingId}`] = Date.now();
    localStorage.setItem(CHAT_READ_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getUnreadCount(
  bookingId: string,
  readerRole: "teacher" | "student" | "parent",
): number {
  try {
    const map = getChatReadMap();
    const lastRead = map[`${readerRole}_${bookingId}`] ?? 0;
    const messages = getChatMessages(bookingId);
    // Count messages from the OTHER role that arrived after lastRead
    // Parents read teacher messages
    const senderRole =
      readerRole === "teacher"
        ? "student"
        : readerRole === "parent"
          ? "teacher"
          : "teacher";
    return messages.filter(
      (m) => m.senderRole === senderRole && m.sentAt > lastRead,
    ).length;
  } catch {
    return 0;
  }
}

// ---- Scheduled Sessions ----

export function getScheduledSessions(): ScheduledSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScheduledSession[];
  } catch {
    return [];
  }
}

export function saveScheduledSession(s: ScheduledSession): void {
  const list = getScheduledSessions();
  list.unshift(s);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(list));
}

export function deleteScheduledSession(id: string): void {
  const list = getScheduledSessions().filter((s) => s.id !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(list));
}
