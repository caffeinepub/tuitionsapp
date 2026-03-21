import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, X } from "lucide-react";
import { type Quiz, getSubmissionsForQuiz } from "../utils/quizStorage";
import { getStudentUsers } from "../utils/studentStorage";

type Props = {
  open: boolean;
  onClose: () => void;
  quiz: Quiz;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function QuizResults({ open, onClose, quiz }: Props) {
  const submissions = getSubmissionsForQuiz(quiz.id);
  const allStudents = getStudentUsers();
  const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  // Per-question accuracy
  const questionAccuracy = quiz.questions.map((q) => {
    const attempts = submissions.filter((s) => s.answers[q.id] !== undefined);
    if (attempts.length === 0) return { question: q, pct: null };
    const correct = attempts.filter((s) => {
      const ans = (s.answers[q.id] ?? "").toLowerCase().trim();
      const expected = q.correctAnswer.toLowerCase().trim();
      if (q.type === "multiple-choice") return ans === expected;
      if (q.type === "true-false") return ans === expected;
      return ans === expected;
    }).length;
    return { question: q, pct: Math.round((correct / attempts.length) * 100) };
  });

  function exportCSV() {
    const rows = [
      [
        "Student",
        "Score",
        "Max",
        "Percentage",
        "Pass/Fail",
        "Status",
        "Time Taken",
        "Attempt #",
      ],
    ];
    for (const student of allStudents) {
      const sub = submissions
        .filter(
          (s) =>
            s.studentUsername.toLowerCase() === student.username.toLowerCase(),
        )
        .sort((a, b) => b.submittedAt - a.submittedAt)[0];
      if (sub) {
        const pct = Math.round((sub.score / sub.maxScore) * 100);
        rows.push([
          sub.studentName,
          String(sub.score),
          String(sub.maxScore),
          `${pct}%`,
          pct >= quiz.settings.passMarkPercent ? "Pass" : "Fail",
          "Submitted",
          formatTime(sub.timeTaken),
          String(sub.attemptNumber),
        ]);
      }
    }
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const url = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quiz.title.replace(/\s+/g, "_")}_results.csv`;
    a.click();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        data-ocid="quiz.results.dialog"
        className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-lg">
              Results: {quiz.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                data-ocid="quiz.results.export.button"
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={exportCSV}
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>
              <Button
                data-ocid="quiz.results.close.button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge
              variant="outline"
              className={`text-xs ${quiz.type === "test" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
            >
              {quiz.type === "test" ? "Test" : "Quiz"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {quiz.questions.length} questions
            </Badge>
            <Badge variant="outline" className="text-xs">
              {maxScore} pts max
            </Badge>
            <Badge variant="outline" className="text-xs">
              {submissions.length} submission
              {submissions.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Per-student table */}
          <div className="px-6 py-4">
            <h3 className="font-display font-bold text-base mb-3">
              Student Results
            </h3>
            {submissions.length === 0 ? (
              <div
                data-ocid="quiz.results.empty_state"
                className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border rounded-xl"
              >
                No submissions yet.
              </div>
            ) : (
              <div className="border border-border/60 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead>Pass/Fail</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Attempt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((sub, i) => {
                      const pct =
                        sub.maxScore > 0
                          ? Math.round((sub.score / sub.maxScore) * 100)
                          : 0;
                      const passed = pct >= quiz.settings.passMarkPercent;
                      return (
                        <TableRow
                          key={sub.id}
                          data-ocid={`quiz.results.row.${i + 1}`}
                        >
                          <TableCell className="font-medium">
                            {sub.studentName}
                          </TableCell>
                          <TableCell>
                            {sub.score}/{sub.maxScore}
                          </TableCell>
                          <TableCell>{pct}%</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                passed
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              {passed ? "Pass" : "Fail"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              Submitted
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatTime(sub.timeTaken)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            #{sub.attemptNumber}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Per-question accuracy */}
          {submissions.length > 0 && (
            <div className="px-6 pb-6">
              <h3 className="font-display font-bold text-base mb-3">
                Per-Question Accuracy
              </h3>
              <div className="space-y-2">
                {questionAccuracy.map((qa, i) => (
                  <div
                    key={qa.question.id}
                    className="flex items-center gap-3 bg-card border border-border/60 rounded-lg px-4 py-3"
                  >
                    <span className="text-xs font-bold text-muted-foreground w-8">
                      Q{i + 1}
                    </span>
                    <p className="flex-1 text-sm text-foreground truncate">
                      {qa.question.text}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {qa.pct !== null ? (
                        <>
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                qa.pct >= 70
                                  ? "bg-green-500"
                                  : qa.pct >= 40
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${qa.pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-10 text-right">
                            {qa.pct}%
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
