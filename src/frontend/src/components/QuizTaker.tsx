import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type Quiz,
  type QuizAssignment,
  type QuizQuestion,
  type QuizSubmission,
  getAttemptsUsed,
  saveQuizSubmission,
} from "../utils/quizStorage";

type Props = {
  open: boolean;
  onClose: () => void;
  quiz: Quiz;
  assignment: QuizAssignment;
  studentUsername: string;
  studentName: string;
};

type Screen = "confirm" | "taking" | "results" | "recorded";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QuizTaker({
  open,
  onClose,
  quiz,
  assignment,
  studentUsername,
  studentName,
}: Props) {
  const [screen, setScreen] = useState<Screen>("confirm");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  // Per-question shuffled options for MC
  const [shuffledOptions, setShuffledOptions] = useState<
    Record<string, string[]>
  >({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const attemptsUsed = getAttemptsUsed(quiz.id, studentUsername);
  const attemptsAllowed = quiz.settings.attemptsAllowed;
  const attemptsRemaining =
    attemptsAllowed === 0
      ? Number.POSITIVE_INFINITY
      : attemptsAllowed - attemptsUsed;

  useEffect(() => {
    if (!open) {
      clearInterval(timerRef.current ?? undefined);
      setScreen("confirm");
      setCurrentIdx(0);
      setAnswers({});
      setConfirmSubmit(false);
    }
  }, [open]);

  function startQuiz() {
    let qs = [...quiz.questions];
    if (quiz.settings.shuffleQuestions) qs = shuffleArray(qs);

    // Build shuffled options map
    const optMap: Record<string, string[]> = {};
    for (const q of qs) {
      if (q.type === "multiple-choice" && q.options) {
        optMap[q.id] = quiz.settings.shuffleAnswers
          ? shuffleArray(q.options)
          : q.options;
      }
    }
    setShuffledOptions(optMap);
    setQuestions(qs);
    setCurrentIdx(0);
    setAnswers({});
    const now = Date.now();
    setStartedAt(now);
    if (quiz.settings.timeLimit > 0) {
      setTimeLeft(quiz.settings.timeLimit * 60);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current ?? undefined);
            // Auto-submit handled in component via useEffect
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    setScreen("taking");
  }

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (
      screen === "taking" &&
      quiz.settings.timeLimit > 0 &&
      timeLeft === 0 &&
      startedAt > 0
    ) {
      handleSubmit(true);
    }
    // handleSubmit is stable within a quiz session; including it would cause infinite loops
    // biome-ignore lint/correctness/useExhaustiveDependencies: stable within session
  }, [timeLeft, screen, quiz.settings.timeLimit, startedAt]); // eslint-disable-line

  function scoreAnswers(
    qs: QuizQuestion[],
    ans: Record<string, string>,
  ): number {
    let score = 0;
    for (const q of qs) {
      const given = (ans[q.id] ?? "").toLowerCase().trim();
      const expected = q.correctAnswer.toLowerCase().trim();
      if (q.type === "multiple-choice") {
        // correctAnswer is index into original options; given is the option text after shuffle
        const originalOpts = q.options ?? [];
        const correctText = originalOpts[Number(q.correctAnswer)] ?? "";
        if (given === correctText.toLowerCase().trim()) score += q.points;
      } else if (q.type === "true-false") {
        if (given === expected) score += q.points;
      } else {
        if (given === expected) score += q.points;
      }
    }
    return score;
  }

  function handleSubmit(auto = false) {
    clearInterval(timerRef.current ?? undefined);
    const now = Date.now();
    const timeTaken = Math.round((now - startedAt) / 1000);
    const maxScore = quiz.questions.reduce((s, q) => s + q.points, 0);
    const score = scoreAnswers(questions, answers);
    const sub: QuizSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      quizId: quiz.id,
      quizAssignmentId: assignment.id,
      studentUsername: studentUsername.toLowerCase(),
      studentName,
      answers,
      score,
      maxScore,
      startedAt,
      submittedAt: now,
      attemptNumber: attemptsUsed + 1,
      timeTaken,
    };
    saveQuizSubmission(sub);
    setSubmission(sub);
    if (auto) toast.info("Time's up! Your answers have been submitted.");
    if (quiz.settings.showResultsToStudent) {
      setScreen("results");
    } else {
      setScreen("recorded");
    }
  }

  const currentQ = questions[currentIdx];

  function formatTimer(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        data-ocid="quiz.taker.dialog"
        className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col p-0"
        onInteractOutside={(e) => {
          if (screen === "taking") e.preventDefault();
        }}
      >
        {/* Confirm screen */}
        {screen === "confirm" && (
          <>
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle className="font-display text-lg">
                {quiz.title}
              </DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-2 flex-1 overflow-y-auto space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${quiz.type === "test" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
                >
                  {quiz.type === "test" ? "Test" : "Quiz"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {quiz.subject}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {quiz.questions.length} questions
                </Badge>
                {quiz.settings.timeLimit > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {quiz.settings.timeLimit} min
                  </Badge>
                )}
              </div>
              <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-semibold text-foreground">Rules</p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  {quiz.settings.timeLimit > 0 && (
                    <li>
                      You have {quiz.settings.timeLimit} minutes to complete
                      this.
                    </li>
                  )}
                  {quiz.settings.shuffleQuestions && (
                    <li>Questions will be shuffled.</li>
                  )}
                  {quiz.settings.shuffleAnswers && (
                    <li>Answer choices will be shuffled.</li>
                  )}
                  <li>Pass mark: {quiz.settings.passMarkPercent}%</li>
                  {quiz.settings.showResultsToStudent ? (
                    <li>Results will be shown after submission.</li>
                  ) : (
                    <li>
                      Your submission will be recorded but results are not
                      shown.
                    </li>
                  )}
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                Attempts used:{" "}
                <span className="font-semibold text-foreground">
                  {attemptsUsed}
                </span>
                {attemptsAllowed > 0 && <> / {attemptsAllowed}</>}
              </p>
            </div>
            <DialogFooter className="px-6 py-4 border-t border-border/60">
              <Button
                data-ocid="quiz.taker.cancel_button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                data-ocid="quiz.taker.start.button"
                className="bg-student hover:bg-student/90 text-white"
                onClick={startQuiz}
                disabled={attemptsRemaining <= 0}
              >
                {attemptsRemaining <= 0 ? "No attempts remaining" : "Start"}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Taking screen */}
        {screen === "taking" && currentQ && (
          <>
            <div className="px-6 pt-5 pb-3 border-b border-border/60 flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Question {currentIdx + 1} / {questions.length}
                </span>
                {quiz.settings.timeLimit > 0 && (
                  <span
                    className={`flex items-center gap-1 text-sm font-bold ${
                      timeLeft <= 60 ? "text-red-500" : "text-foreground"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    {formatTimer(timeLeft)}
                  </span>
                )}
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full mt-2">
                <div
                  className="bg-student h-1.5 rounded-full transition-all"
                  style={{
                    width: `${((currentIdx + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <p className="text-base font-medium text-foreground">
                {currentQ.text}
              </p>

              {/* Multiple choice */}
              {currentQ.type === "multiple-choice" && (
                <div className="space-y-2">
                  {(shuffledOptions[currentQ.id] ?? currentQ.options ?? []).map(
                    (opt, i) => (
                      <label
                        key={`mc_${String(i)}`}
                        className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                          answers[currentQ.id] === opt
                            ? "border-student bg-student-light"
                            : "border-border hover:border-student/40 hover:bg-muted/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${currentQ.id}`}
                          value={opt}
                          checked={answers[currentQ.id] === opt}
                          onChange={() =>
                            setAnswers((p) => ({ ...p, [currentQ.id]: opt }))
                          }
                          className="accent-student"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ),
                  )}
                </div>
              )}

              {/* True/False */}
              {currentQ.type === "true-false" && (
                <div className="flex gap-3">
                  {["true", "false"].map((v) => (
                    <label
                      key={v}
                      className={`flex-1 flex items-center justify-center gap-2 border rounded-xl py-3 cursor-pointer transition-colors capitalize ${
                        answers[currentQ.id] === v
                          ? "border-student bg-student-light font-medium"
                          : "border-border hover:border-student/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q_${currentQ.id}`}
                        value={v}
                        checked={answers[currentQ.id] === v}
                        onChange={() =>
                          setAnswers((p) => ({ ...p, [currentQ.id]: v }))
                        }
                        className="accent-student"
                      />
                      {v === "true" ? "True" : "False"}
                    </label>
                  ))}
                </div>
              )}

              {/* Short answer / fill blank */}
              {(currentQ.type === "short-answer" ||
                currentQ.type === "fill-blank") && (
                <Input
                  data-ocid="quiz.taker.answer.input"
                  placeholder={
                    currentQ.type === "fill-blank"
                      ? "Fill in the blank..."
                      : "Your answer..."
                  }
                  value={answers[currentQ.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((p) => ({ ...p, [currentQ.id]: e.target.value }))
                  }
                />
              )}
            </div>
            <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between flex-shrink-0">
              <Button
                data-ocid="quiz.taker.prev.button"
                variant="outline"
                size="sm"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((i) => i - 1)}
              >
                Previous
              </Button>
              <div className="flex gap-2">
                {currentIdx < questions.length - 1 ? (
                  <Button
                    data-ocid="quiz.taker.next.button"
                    size="sm"
                    className="bg-student hover:bg-student/90 text-white"
                    onClick={() => setCurrentIdx((i) => i + 1)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    data-ocid="quiz.taker.submit.button"
                    size="sm"
                    className="bg-teacher hover:bg-teacher/90 text-white"
                    onClick={() => setConfirmSubmit(true)}
                  >
                    Submit
                  </Button>
                )}
              </div>
            </div>
            {/* Confirm submit dialog */}
            <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
              <DialogContent
                data-ocid="quiz.taker.confirm.dialog"
                className="sm:max-w-sm"
              >
                <DialogHeader>
                  <DialogTitle className="font-display">
                    Submit Quiz?
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  You have answered {Object.keys(answers).length} of{" "}
                  {questions.length} questions.
                  {Object.keys(answers).length < questions.length &&
                    " Unanswered questions will be marked as incorrect."}
                </p>
                <DialogFooter className="gap-2">
                  <Button
                    data-ocid="quiz.taker.confirm.cancel_button"
                    variant="outline"
                    onClick={() => setConfirmSubmit(false)}
                  >
                    Keep Going
                  </Button>
                  <Button
                    data-ocid="quiz.taker.confirm.confirm_button"
                    className="bg-teacher hover:bg-teacher/90 text-white"
                    onClick={() => {
                      setConfirmSubmit(false);
                      handleSubmit();
                    }}
                  >
                    Submit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Results screen */}
        {screen === "results" && submission && (
          <>
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle className="font-display text-lg">
                Results
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
              {/* Score summary */}
              <div className="text-center py-6">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    submission.maxScore > 0 &&
                    (submission.score / submission.maxScore) * 100 >=
                      quiz.settings.passMarkPercent
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  {submission.maxScore > 0 &&
                  (submission.score / submission.maxScore) * 100 >=
                    quiz.settings.passMarkPercent ? (
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-500" />
                  )}
                </div>
                <p className="font-display text-3xl font-bold text-foreground">
                  {submission.score}/{submission.maxScore}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  {submission.maxScore > 0
                    ? Math.round((submission.score / submission.maxScore) * 100)
                    : 0}
                  % &bull;{" "}
                  {submission.maxScore > 0 &&
                  (submission.score / submission.maxScore) * 100 >=
                    quiz.settings.passMarkPercent ? (
                    <span className="text-green-600 font-semibold">Pass</span>
                  ) : (
                    <span className="text-red-500 font-semibold">Fail</span>
                  )}
                </p>
              </div>

              {/* Per-question review */}
              <div className="space-y-2">
                {questions.map((q, i) => {
                  const given = submission.answers[q.id] ?? "";
                  let isCorrect = false;
                  if (q.type === "multiple-choice") {
                    const correctText =
                      (q.options ?? [])[Number(q.correctAnswer)] ?? "";
                    isCorrect =
                      given.toLowerCase().trim() ===
                      correctText.toLowerCase().trim();
                  } else {
                    isCorrect =
                      given.toLowerCase().trim() ===
                      q.correctAnswer.toLowerCase().trim();
                  }
                  return (
                    <div
                      key={q.id}
                      className={`rounded-xl border px-4 py-3 ${
                        isCorrect
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {i + 1}. {q.text}
                          </p>
                          {!isCorrect && (
                            <div className="mt-1 space-y-0.5">
                              <p className="text-xs text-red-600">
                                Your answer: {given || "(not answered)"}
                              </p>
                              {q.type === "multiple-choice" ? (
                                <p className="text-xs text-green-700">
                                  Correct:{" "}
                                  {(q.options ?? [])[Number(q.correctAnswer)]}
                                </p>
                              ) : (
                                <p className="text-xs text-green-700">
                                  Correct: {q.correctAnswer}
                                </p>
                              )}
                            </div>
                          )}
                          {q.explanation && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border/60 flex-shrink-0">
              <Button
                data-ocid="quiz.taker.close.button"
                className="w-full"
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </>
        )}

        {/* Recorded screen */}
        {screen === "recorded" && (
          <>
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle className="font-display text-lg">
                Submitted
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 px-6 py-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-base font-semibold text-foreground">
                Your submission has been recorded.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Your teacher will review and share results.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-border/60">
              <Button
                data-ocid="quiz.recorded.close.button"
                className="w-full"
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
