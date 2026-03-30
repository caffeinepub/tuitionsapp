// ─── Types ────────────────────────────────────────────────────────────────────

export type SupportTicket = {
  id: string;
  senderRole: "teacher" | "parent";
  senderName: string;
  senderPrincipal: string;
  subject: string;
  message: string;
  status: "open" | "closed";
  createdAt: string;
};

export type SupportChatMessage = {
  id: string;
  ticketId: string;
  senderRole: "teacher" | "parent" | "admin";
  senderName: string;
  text: string;
  sentAt: string;
};

export type SupportReport = {
  id: string;
  reporterRole: "student" | "teacher" | "parent";
  reporterName: string;
  reportedUserType: "student" | "teacher" | "parent";
  reportedUserName: string;
  reason: string;
  status: "pending" | "actioned";
  createdAt: string;
};

// ─── Keys ─────────────────────────────────────────────────────────────────────

const TICKETS_KEY = "tuitions_support_tickets";
const SUPPORT_CHAT_KEY = "tuitions_support_chat";
const REPORTS_KEY = "tuitions_reports";
const TEACHER_BANS_KEY = "tuitions_teacher_bans";
const TEACHER_WARNINGS_KEY = "tuitions_teacher_warnings";
const TEACHER_DELETED_KEY = "tuitions_teacher_deleted";
const PARENT_BANS_KEY = "tuitions_parent_bans";
const PARENT_DELETED_KEY = "tuitions_parent_deleted";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export function getTickets(): SupportTicket[] {
  return load<SupportTicket>(TICKETS_KEY);
}

export function getTicketsForSender(principal: string): SupportTicket[] {
  return getTickets().filter((t) => t.senderPrincipal === principal);
}

export function submitTicket(
  senderRole: "teacher" | "parent",
  senderName: string,
  senderPrincipal: string,
  subject: string,
  message: string,
): SupportTicket {
  const ticket: SupportTicket = {
    id: uid(),
    senderRole,
    senderName,
    senderPrincipal,
    subject,
    message,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  const tickets = getTickets();
  tickets.push(ticket);
  save(TICKETS_KEY, tickets);
  return ticket;
}

export function closeTicket(id: string): void {
  const tickets = getTickets().map((t) =>
    t.id === id ? { ...t, status: "closed" as const } : t,
  );
  save(TICKETS_KEY, tickets);
}

// ─── Support Chat ─────────────────────────────────────────────────────────────

export function getSupportChat(ticketId: string): SupportChatMessage[] {
  return load<SupportChatMessage>(SUPPORT_CHAT_KEY).filter(
    (m) => m.ticketId === ticketId,
  );
}

export function getAllSupportChats(): SupportChatMessage[] {
  return load<SupportChatMessage>(SUPPORT_CHAT_KEY);
}

export function sendSupportMessage(
  ticketId: string,
  senderRole: "teacher" | "parent" | "admin",
  senderName: string,
  text: string,
): void {
  const msgs = load<SupportChatMessage>(SUPPORT_CHAT_KEY);
  msgs.push({
    id: uid(),
    ticketId,
    senderRole,
    senderName,
    text,
    sentAt: new Date().toISOString(),
  });
  save(SUPPORT_CHAT_KEY, msgs);
}

// Direct admin chat without a formal ticket (use principal as ticketId key)
export function getDirectChat(principal: string): SupportChatMessage[] {
  return load<SupportChatMessage>(SUPPORT_CHAT_KEY).filter(
    (m) => m.ticketId === `direct:${principal}`,
  );
}

export function sendDirectMessage(
  principal: string,
  senderRole: "teacher" | "parent" | "admin",
  senderName: string,
  text: string,
): void {
  const msgs = load<SupportChatMessage>(SUPPORT_CHAT_KEY);
  msgs.push({
    id: uid(),
    ticketId: `direct:${principal}`,
    senderRole,
    senderName,
    text,
    sentAt: new Date().toISOString(),
  });
  save(SUPPORT_CHAT_KEY, msgs);
}

export function getAllDirectChats(): {
  principal: string;
  lastMsg: string;
  senderName: string;
}[] {
  const all = load<SupportChatMessage>(SUPPORT_CHAT_KEY).filter((m) =>
    m.ticketId.startsWith("direct:"),
  );
  const map = new Map<string, SupportChatMessage>();
  for (const m of all) {
    const p = m.ticketId.replace("direct:", "");
    if (!map.has(p) || new Date(m.sentAt) > new Date(map.get(p)!.sentAt)) {
      map.set(p, m);
    }
  }
  return Array.from(map.entries()).map(([principal, m]) => ({
    principal,
    lastMsg: m.text,
    senderName: m.senderName,
  }));
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export function getReports(): SupportReport[] {
  return load<SupportReport>(REPORTS_KEY);
}

export function submitReport(
  reporterRole: "student" | "teacher" | "parent",
  reporterName: string,
  reportedUserType: "student" | "teacher" | "parent",
  reportedUserName: string,
  reason: string,
): void {
  const reports = getReports();
  reports.push({
    id: uid(),
    reporterRole,
    reporterName,
    reportedUserType,
    reportedUserName,
    reason,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  save(REPORTS_KEY, reports);
}

export function markReportActioned(id: string): void {
  const reports = getReports().map((r) =>
    r.id === id ? { ...r, status: "actioned" as const } : r,
  );
  save(REPORTS_KEY, reports);
}

export function deleteReport(id: string): void {
  save(
    REPORTS_KEY,
    getReports().filter((r) => r.id !== id),
  );
}

// ─── Teacher Bans / Warnings ──────────────────────────────────────────────────

function loadSet(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveSet(key: string, set: string[]): void {
  localStorage.setItem(key, JSON.stringify(set));
}

export function banTeacher(name: string): void {
  const set = loadSet(TEACHER_BANS_KEY);
  if (!set.includes(name)) set.push(name);
  saveSet(TEACHER_BANS_KEY, set);
}

export function unbanTeacher(name: string): void {
  saveSet(
    TEACHER_BANS_KEY,
    loadSet(TEACHER_BANS_KEY).filter((n) => n !== name),
  );
}

export function isTeacherBanned(name: string): boolean {
  return loadSet(TEACHER_BANS_KEY).includes(name);
}

export function getTeacherBans(): string[] {
  return loadSet(TEACHER_BANS_KEY);
}

export function deleteTeacher(name: string): void {
  const set = loadSet(TEACHER_DELETED_KEY);
  if (!set.includes(name)) set.push(name);
  saveSet(TEACHER_DELETED_KEY, set);
  banTeacher(name);
}

export function getDeletedTeachers(): string[] {
  return loadSet(TEACHER_DELETED_KEY);
}

export type TeacherWarning = {
  name: string;
  message: string;
  issuedAt: string;
};

export function getTeacherWarnings(): TeacherWarning[] {
  try {
    const raw = localStorage.getItem(TEACHER_WARNINGS_KEY);
    return raw ? (JSON.parse(raw) as TeacherWarning[]) : [];
  } catch {
    return [];
  }
}

export function getWarningsForTeacher(name: string): TeacherWarning[] {
  return getTeacherWarnings().filter((w) => w.name === name);
}

export function warnTeacher(name: string, message: string): void {
  const warnings = getTeacherWarnings();
  warnings.push({ name, message, issuedAt: new Date().toISOString() });
  localStorage.setItem(TEACHER_WARNINGS_KEY, JSON.stringify(warnings));
}

export function clearTeacherWarnings(name: string): void {
  const warnings = getTeacherWarnings().filter((w) => w.name !== name);
  localStorage.setItem(TEACHER_WARNINGS_KEY, JSON.stringify(warnings));
}

// ─── Parent Bans ──────────────────────────────────────────────────────────────

export function banParent(principal: string): void {
  const set = loadSet(PARENT_BANS_KEY);
  if (!set.includes(principal)) set.push(principal);
  saveSet(PARENT_BANS_KEY, set);
}

export function unbanParent(principal: string): void {
  saveSet(
    PARENT_BANS_KEY,
    loadSet(PARENT_BANS_KEY).filter((p) => p !== principal),
  );
}

export function isParentBanned(principal: string): boolean {
  return loadSet(PARENT_BANS_KEY).includes(principal);
}

export function getParentBans(): string[] {
  return loadSet(PARENT_BANS_KEY);
}

export function deleteParent(principal: string): void {
  const set = loadSet(PARENT_DELETED_KEY);
  if (!set.includes(principal)) set.push(principal);
  saveSet(PARENT_DELETED_KEY, set);
  banParent(principal);
}

// ─── Student Warnings ─────────────────────────────────────────────────────────
// Students get warnings visible in chat

const STUDENT_WARNINGS_KEY = "tuitions_student_warnings";

export type StudentWarning = {
  username: string;
  message: string;
  issuedAt: string;
};

export function getStudentWarnings(): StudentWarning[] {
  try {
    const raw = localStorage.getItem(STUDENT_WARNINGS_KEY);
    return raw ? (JSON.parse(raw) as StudentWarning[]) : [];
  } catch {
    return [];
  }
}

export function getWarningsForStudent(username: string): StudentWarning[] {
  return getStudentWarnings().filter((w) => w.username === username);
}

export function warnStudent(username: string, message: string): void {
  const warnings = getStudentWarnings();
  warnings.push({ username, message, issuedAt: new Date().toISOString() });
  localStorage.setItem(STUDENT_WARNINGS_KEY, JSON.stringify(warnings));
}

export function clearStudentWarnings(username: string): void {
  const warnings = getStudentWarnings().filter((w) => w.username !== username);
  localStorage.setItem(STUDENT_WARNINGS_KEY, JSON.stringify(warnings));
}

// ─── Helpy Feedback ───────────────────────────────────────────────────────────

const HELPY_FEEDBACK_KEY = "tuitions_helpy_feedback";

export type HelpyFeedback = {
  id: string;
  messageId: string;
  helpyReply: string;
  rating: "up" | "down";
  reason?: string; // only for "down"
  senderRole: "teacher" | "parent";
  senderName: string;
  createdAt: string;
};

export function getHelpyFeedback(): HelpyFeedback[] {
  try {
    const raw = localStorage.getItem(HELPY_FEEDBACK_KEY);
    return raw ? (JSON.parse(raw) as HelpyFeedback[]) : [];
  } catch {
    return [];
  }
}

export function submitHelpyFeedback(
  feedback: Omit<HelpyFeedback, "id" | "createdAt">,
): void {
  const all = getHelpyFeedback();
  // Only one feedback per messageId
  if (all.some((f) => f.messageId === feedback.messageId)) return;
  all.push({
    ...feedback,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(HELPY_FEEDBACK_KEY, JSON.stringify(all));
}

// ─── Teacher-Parent Direct Chat ───────────────────────────────────────────────

const TP_CHAT_KEY = "tuitions_tp_chat";

export type TpChatMessage = {
  id: string;
  channel: string; // format: "tp:teacherName:studentUsername"
  senderRole: "teacher" | "parent";
  senderName: string;
  text: string;
  sentAt: number; // timestamp ms
};

export function getTpMessages(channel: string): TpChatMessage[] {
  try {
    const raw = localStorage.getItem(TP_CHAT_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as TpChatMessage[]).filter(
      (m) => m.channel === channel,
    );
  } catch {
    return [];
  }
}

export function sendTpMessage(
  channel: string,
  senderRole: "teacher" | "parent",
  senderName: string,
  text: string,
): void {
  try {
    const raw = localStorage.getItem(TP_CHAT_KEY);
    const msgs: TpChatMessage[] = raw ? JSON.parse(raw) : [];
    msgs.push({
      id: `tp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      channel,
      senderRole,
      senderName,
      text,
      sentAt: Date.now(),
    });
    localStorage.setItem(TP_CHAT_KEY, JSON.stringify(msgs));
  } catch {}
}

export function getAllTpChats(): { channel: string; lastMsg: TpChatMessage }[] {
  try {
    const raw = localStorage.getItem(TP_CHAT_KEY);
    if (!raw) return [];
    const msgs = JSON.parse(raw) as TpChatMessage[];
    const map = new Map<string, TpChatMessage>();
    for (const m of msgs) {
      const existing = map.get(m.channel);
      if (!existing || m.sentAt > existing.sentAt) map.set(m.channel, m);
    }
    return Array.from(map.entries()).map(([channel, lastMsg]) => ({
      channel,
      lastMsg,
    }));
  } catch {
    return [];
  }
}
