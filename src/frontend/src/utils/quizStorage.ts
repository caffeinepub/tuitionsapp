export type QuestionType =
  | "multiple-choice"
  | "short-answer"
  | "true-false"
  | "fill-blank";

export type QuizQuestion = {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  explanation?: string;
};

export type QuizSettings = {
  timeLimit: number;
  attemptsAllowed: number;
  dueDate: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showResultsToStudent: boolean;
  passMarkPercent: number;
};

export type Quiz = {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  type: "quiz" | "test";
  questions: QuizQuestion[];
  settings: QuizSettings;
  teacherName: string;
  createdAt: number;
};

export type QuizAssignment = {
  id: string;
  quizId: string;
  quizTitle: string;
  teacherName: string;
  assignedTo: "all" | "class" | "individual";
  studentUsernames: string[];
  classGroup: string;
  releaseAt: number | null;
  assignedAt: number;
};

export type QuizSubmission = {
  id: string;
  quizId: string;
  quizAssignmentId: string;
  studentUsername: string;
  studentName: string;
  answers: Record<string, string>;
  score: number;
  maxScore: number;
  startedAt: number;
  submittedAt: number;
  attemptNumber: number;
  timeTaken: number;
};

const QUIZZES_KEY = "tuitions_quizzes";
const ASSIGNMENTS_KEY = "tuitions_quiz_assignments";
const SUBMISSIONS_KEY = "tuitions_quiz_submissions";

function loadJSON<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function saveJSON<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getQuizzes(): Quiz[] {
  return loadJSON<Quiz>(QUIZZES_KEY);
}

export function saveQuiz(q: Quiz): void {
  const list = getQuizzes();
  list.push(q);
  saveJSON(QUIZZES_KEY, list);
}

export function updateQuiz(q: Quiz): void {
  const list = getQuizzes();
  const idx = list.findIndex((x) => x.id === q.id);
  if (idx >= 0) {
    list[idx] = q;
  } else {
    list.push(q);
  }
  saveJSON(QUIZZES_KEY, list);
}

export function deleteQuiz(id: string): void {
  saveJSON(
    QUIZZES_KEY,
    getQuizzes().filter((q) => q.id !== id),
  );
  // Also remove assignments for this quiz
  saveJSON(
    ASSIGNMENTS_KEY,
    getQuizAssignments().filter((a) => a.quizId !== id),
  );
}

export function getQuizAssignments(): QuizAssignment[] {
  return loadJSON<QuizAssignment>(ASSIGNMENTS_KEY);
}

export function saveQuizAssignment(a: QuizAssignment): void {
  const list = getQuizAssignments();
  list.push(a);
  saveJSON(ASSIGNMENTS_KEY, list);
}

export function deleteQuizAssignment(id: string): void {
  saveJSON(
    ASSIGNMENTS_KEY,
    getQuizAssignments().filter((a) => a.id !== id),
  );
}

export function getQuizSubmissions(): QuizSubmission[] {
  return loadJSON<QuizSubmission>(SUBMISSIONS_KEY);
}

export function saveQuizSubmission(s: QuizSubmission): void {
  const list = getQuizSubmissions();
  list.push(s);
  saveJSON(SUBMISSIONS_KEY, list);
}

export function getSubmissionsForQuiz(quizId: string): QuizSubmission[] {
  return getQuizSubmissions().filter((s) => s.quizId === quizId);
}

export function getSubmissionsForStudent(username: string): QuizSubmission[] {
  const lower = username.toLowerCase();
  return getQuizSubmissions().filter(
    (s) => s.studentUsername.toLowerCase() === lower,
  );
}

export function getAssignedQuizzesForStudent(
  username: string,
): Array<{ quiz: Quiz; assignment: QuizAssignment }> {
  const lower = username.toLowerCase();
  const now = Date.now();
  const assignments = getQuizAssignments();
  const quizzes = getQuizzes();

  const result: Array<{ quiz: Quiz; assignment: QuizAssignment }> = [];

  for (const a of assignments) {
    if (a.releaseAt !== null && a.releaseAt > now) continue;

    const isAssigned =
      a.assignedTo === "all" ||
      a.studentUsernames.some((u) => u.toLowerCase() === lower);

    if (!isAssigned) continue;

    const quiz = quizzes.find((q) => q.id === a.quizId);
    if (!quiz) continue;

    result.push({ quiz, assignment: a });
  }

  return result;
}

export function getAttemptsUsed(
  quizId: string,
  studentUsername: string,
): number {
  const lower = studentUsername.toLowerCase();
  return getQuizSubmissions().filter(
    (s) => s.quizId === quizId && s.studentUsername.toLowerCase() === lower,
  ).length;
}
