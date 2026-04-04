// Term end and holiday scheduling storage
// Teachers schedule term ends and holidays; students and parents can view them.

const TERM_SCHEDULES_KEY = "tuitions_term_schedules";

export type HolidayPeriod = {
  id: string;
  label: string;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
};

export type TermSchedule = {
  teacherName: string;
  termEndDate: string; // yyyy-mm-dd, empty string = not set
  holidays: HolidayPeriod[];
  updatedAt: number;
};

function getAllTermSchedules(): TermSchedule[] {
  try {
    const raw = localStorage.getItem(TERM_SCHEDULES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TermSchedule[];
  } catch {
    return [];
  }
}

function saveAllTermSchedules(schedules: TermSchedule[]): void {
  localStorage.setItem(TERM_SCHEDULES_KEY, JSON.stringify(schedules));
}

export function getTermScheduleForTeacher(teacherName: string): TermSchedule {
  const all = getAllTermSchedules();
  return (
    all.find((s) => s.teacherName === teacherName) ?? {
      teacherName,
      termEndDate: "",
      holidays: [],
      updatedAt: 0,
    }
  );
}

export function saveTermScheduleForTeacher(schedule: TermSchedule): void {
  const all = getAllTermSchedules();
  const idx = all.findIndex((s) => s.teacherName === schedule.teacherName);
  if (idx >= 0) {
    all[idx] = schedule;
  } else {
    all.push(schedule);
  }
  saveAllTermSchedules(all);
}

export function getAllTermSchedules_public(): TermSchedule[] {
  return getAllTermSchedules().filter(
    (s) => s.termEndDate || s.holidays.length > 0,
  );
}
