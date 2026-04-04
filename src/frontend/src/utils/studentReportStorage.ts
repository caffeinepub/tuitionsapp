// Student report storage: teacher generates AI reports; students and parents can view.

const REPORTS_KEY = "tuitions_student_reports";

export type ReportEntry = {
  subject: string;
  grade: string;
  aiComment: string;
};

export type StudentReport = {
  id: string;
  studentUsername: string;
  studentName: string;
  teacherName: string;
  generatedAt: number;
  termLabel: string;
  entries: ReportEntry[];
  overallSummary: string;
};

export function getStudentReports(): StudentReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StudentReport[];
  } catch {
    return [];
  }
}

export function saveStudentReport(report: StudentReport): void {
  const all = getStudentReports();
  // Replace existing report for same student+teacher if exists, otherwise push
  const idx = all.findIndex(
    (r) =>
      r.studentUsername === report.studentUsername &&
      r.teacherName === report.teacherName,
  );
  if (idx >= 0) {
    all[idx] = report;
  } else {
    all.unshift(report);
  }
  localStorage.setItem(REPORTS_KEY, JSON.stringify(all));
}

export function getReportsForStudent(studentUsername: string): StudentReport[] {
  return getStudentReports().filter(
    (r) => r.studentUsername.toLowerCase() === studentUsername.toLowerCase(),
  );
}

export function getReportsByTeacher(teacherName: string): StudentReport[] {
  return getStudentReports().filter((r) => r.teacherName === teacherName);
}
