// Roll call storage: teachers submit attendance; admin can review.

const ROLL_CALLS_KEY = "tuitions_roll_calls";

export type RollEntry = {
  username: string;
  present: boolean;
};

export type RollCall = {
  id: string;
  classId: string;
  className: string;
  teacherName: string;
  date: string; // ISO date yyyy-mm-dd
  submittedAt: number;
  entries: RollEntry[];
};

function getAllRollCalls(): RollCall[] {
  try {
    const raw = localStorage.getItem(ROLL_CALLS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RollCall[];
  } catch {
    return [];
  }
}

export function submitRollCall(
  classId: string,
  className: string,
  teacherName: string,
  entries: RollEntry[],
): void {
  const all = getAllRollCalls();
  const today = new Date().toISOString().split("T")[0];
  const roll: RollCall = {
    id: `roll_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    classId,
    className,
    teacherName,
    date: today,
    submittedAt: Date.now(),
    entries,
  };
  all.push(roll);
  localStorage.setItem(ROLL_CALLS_KEY, JSON.stringify(all));
}

export function getAllRollCallsForAdmin(): RollCall[] {
  return getAllRollCalls().sort((a, b) => b.submittedAt - a.submittedAt);
}

export function getRollCallsForClass(classId: string): RollCall[] {
  return getAllRollCalls()
    .filter((r) => r.classId === classId)
    .sort((a, b) => b.submittedAt - a.submittedAt);
}
