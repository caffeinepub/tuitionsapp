const CLASSES_KEY = "tuitions_teacher_classes";

export type ClassAnnouncement = {
  id: string;
  text: string;
  createdAt: number;
};

export type TeacherClass = {
  id: string;
  name: string;
  subject: string;
  teacherName: string;
  classCode: string;
  studentUsernames: string[];
  createdAt: number;
  announcements: ClassAnnouncement[];
};

function generateClassCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getAllClasses(): TeacherClass[] {
  try {
    const raw = localStorage.getItem(CLASSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TeacherClass[];
    // backward compat: ensure announcements array exists
    return parsed.map((c) => ({ ...c, announcements: c.announcements ?? [] }));
  } catch {
    return [];
  }
}

function saveAllClasses(classes: TeacherClass[]): void {
  localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
}

export function getClassesForTeacher(teacherName: string): TeacherClass[] {
  return getAllClasses().filter(
    (c) => c.teacherName.toLowerCase() === teacherName.toLowerCase(),
  );
}

export function getClassesForStudent(username: string): TeacherClass[] {
  return getAllClasses().filter((c) =>
    c.studentUsernames.some((u) => u.toLowerCase() === username.toLowerCase()),
  );
}

export function createClass(
  name: string,
  subject: string,
  teacherName: string,
): TeacherClass {
  const all = getAllClasses();
  let code = generateClassCode();
  const existingCodes = new Set(all.map((c) => c.classCode));
  while (existingCodes.has(code)) {
    code = generateClassCode();
  }
  const newClass: TeacherClass = {
    id: `cls_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    subject: subject.trim(),
    teacherName: teacherName.trim(),
    classCode: code,
    studentUsernames: [],
    createdAt: Date.now(),
    announcements: [],
  };
  all.push(newClass);
  saveAllClasses(all);
  return newClass;
}

export function deleteClass(id: string): void {
  const all = getAllClasses().filter((c) => c.id !== id);
  saveAllClasses(all);
}

export function addStudentToClass(
  classId: string,
  username: string,
): { success: boolean; message: string } {
  const all = getAllClasses();
  const idx = all.findIndex((c) => c.id === classId);
  if (idx === -1) return { success: false, message: "Class not found." };
  const cls = all[idx];
  if (
    cls.studentUsernames.some((u) => u.toLowerCase() === username.toLowerCase())
  ) {
    return { success: false, message: "Student is already in this class." };
  }
  all[idx] = {
    ...cls,
    studentUsernames: [...cls.studentUsernames, username.toLowerCase()],
  };
  saveAllClasses(all);
  return { success: true, message: `${username} added to class.` };
}

export function removeStudentFromClass(
  classId: string,
  username: string,
): void {
  const all = getAllClasses();
  const idx = all.findIndex((c) => c.id === classId);
  if (idx === -1) return;
  all[idx] = {
    ...all[idx],
    studentUsernames: all[idx].studentUsernames.filter(
      (u) => u.toLowerCase() !== username.toLowerCase(),
    ),
  };
  saveAllClasses(all);
}

export function joinClassByCode(
  code: string,
  username: string,
): { success: boolean; message: string; className?: string } {
  const all = getAllClasses();
  const idx = all.findIndex(
    (c) => c.classCode.toUpperCase() === code.trim().toUpperCase(),
  );
  if (idx === -1) {
    return { success: false, message: "Invalid class code. Please try again." };
  }
  const cls = all[idx];
  if (
    cls.studentUsernames.some((u) => u.toLowerCase() === username.toLowerCase())
  ) {
    return {
      success: false,
      message: `You are already in "${cls.name}".`,
    };
  }
  all[idx] = {
    ...cls,
    studentUsernames: [...cls.studentUsernames, username.toLowerCase()],
  };
  saveAllClasses(all);
  return {
    success: true,
    message: `Successfully joined "${cls.name}"!`,
    className: cls.name,
  };
}

export function postAnnouncement(
  classId: string,
  text: string,
): { success: boolean } {
  const all = getAllClasses();
  const idx = all.findIndex((c) => c.id === classId);
  if (idx === -1) return { success: false };
  const announcement: ClassAnnouncement = {
    id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    text: text.trim(),
    createdAt: Date.now(),
  };
  all[idx] = {
    ...all[idx],
    announcements: [announcement, ...(all[idx].announcements ?? [])],
  };
  saveAllClasses(all);
  return { success: true };
}

export function deleteAnnouncement(
  classId: string,
  announcementId: string,
): void {
  const all = getAllClasses();
  const idx = all.findIndex((c) => c.id === classId);
  if (idx === -1) return;
  all[idx] = {
    ...all[idx],
    announcements: (all[idx].announcements ?? []).filter(
      (a) => a.id !== announcementId,
    ),
  };
  saveAllClasses(all);
}
