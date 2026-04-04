import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Printer,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getGradesForStudent } from "../utils/assignmentStorage";
import {
  type StudentReport,
  getReportsByTeacher,
  saveStudentReport,
} from "../utils/studentReportStorage";
import { getStudentUsers } from "../utils/studentStorage";

type Props = {
  teacherName: string;
  onClose: () => void;
};

function generateAiComment(subject: string, grade: string): string {
  const gradeNum = Number.parseFloat(grade);
  const isPercent = !Number.isNaN(gradeNum);
  const isHigh = isPercent
    ? gradeNum >= 75
    : ["A+", "A", "A-", "Excellent", "Outstanding"].some((g) =>
        grade.toUpperCase().includes(g),
      );
  const isMid = isPercent
    ? gradeNum >= 50 && gradeNum < 75
    : ["B", "C", "Good", "Satisfactory"].some((g) =>
        grade.toUpperCase().includes(g),
      );
  const isLow = isPercent
    ? gradeNum < 50
    : ["D", "E", "F", "Fail", "Poor", "Below"].some((g) =>
        grade.toUpperCase().includes(g),
      );

  const subjectLower = subject.toLowerCase();

  const highComments: Record<string, string[]> = {
    math: [
      "Demonstrates excellent numerical reasoning and strong problem-solving ability.",
      "Shows outstanding understanding of mathematical concepts and applies them with confidence.",
    ],
    maths: [
      "Demonstrates excellent numerical reasoning and strong problem-solving ability.",
      "Shows outstanding understanding of mathematical concepts and applies them with confidence.",
    ],
    mathematics: [
      "Exceptional grasp of mathematical principles. Consistently produces accurate and well-structured solutions.",
    ],
    science: [
      "Shows great enthusiasm and thorough understanding of scientific concepts.",
      "Produces detailed and accurate scientific analysis across all topics studied.",
    ],
    english: [
      "Writes with clarity and creativity. Demonstrates a strong command of language and grammar.",
      "Excels in both written and verbal communication skills.",
    ],
    history: [
      "Demonstrates in-depth knowledge of historical events and excellent analytical skills.",
    ],
    geography: [
      "Shows a thorough understanding of geographical concepts and applies them effectively.",
    ],
    default: [
      "Has demonstrated exceptional effort and understanding throughout the term.",
      "Consistently performs at a high level, showing great dedication and enthusiasm.",
      "An outstanding student who fully meets and exceeds expectations in this subject.",
    ],
  };

  const midComments: Record<string, string[]> = {
    math: [
      "Shows a reasonable understanding of core mathematics. With more practice on problem-solving, further progress is possible.",
    ],
    maths: [
      "Shows a reasonable understanding of core mathematics. With more practice on problem-solving, further progress is possible.",
    ],
    mathematics: [
      "Has grasped the key mathematical concepts. Focusing on accuracy in calculations will help improve results.",
    ],
    science: [
      "Demonstrates a sound understanding of science. Extending revision to experimental methods will strengthen performance.",
    ],
    english: [
      "Shows satisfactory written skills. Developing vocabulary and practising extended writing will improve overall performance.",
    ],
    default: [
      "Shows good effort and a satisfactory understanding of the subject. Continued revision and engagement will lead to further improvement.",
      "Meeting the expected standard. There is clear potential to achieve more with consistent effort.",
      "Demonstrates a developing understanding. Focusing on revision and practising key skills will help raise attainment.",
    ],
  };

  const lowComments: Record<string, string[]> = {
    math: [
      "Needs to focus on strengthening foundational mathematical skills. Regular practice and seeking help with difficult areas is recommended.",
    ],
    maths: [
      "Needs to focus on strengthening foundational mathematical skills. Regular practice and seeking help with difficult areas is recommended.",
    ],
    science: [
      "Additional support with core scientific concepts would be beneficial. Reviewing class notes and completing practice questions will help.",
    ],
    english: [
      "Requires improvement in written expression. Reading regularly and practising grammar exercises is strongly encouraged.",
    ],
    default: [
      "There are areas requiring further development. Targeted revision and regular engagement with the subject material is strongly recommended.",
      "Performance this term has been below expectations. With dedicated effort and additional support, improvement is achievable.",
      "Requires additional practice in this subject. Seeking help early and reviewing core concepts will make a significant difference.",
    ],
  };

  function pickComment(map: Record<string, string[]>): string {
    const key = Object.keys(map).find(
      (k) => k !== "default" && subjectLower.includes(k),
    );
    const list = key ? map[key] : map.default;
    return list[Math.floor(Math.random() * list.length)];
  }

  if (isHigh) return pickComment(highComments);
  if (isLow) return pickComment(lowComments);
  if (isMid) return pickComment(midComments);
  // default mid
  return pickComment(midComments);
}

function generateOverallSummary(
  studentName: string,
  entries: { subject: string; grade: string }[],
): string {
  const firstName = studentName.split(" ")[0];
  if (entries.length === 0)
    return `${firstName} has completed the term. We encourage continued engagement across all subjects.`;

  const grades = entries
    .map((e) => Number.parseFloat(e.grade))
    .filter((n) => !Number.isNaN(n));
  const hasNumeric = grades.length > 0;
  const avg = hasNumeric
    ? grades.reduce((a, b) => a + b, 0) / grades.length
    : null;

  if (avg !== null && avg >= 75) {
    return `${firstName} has had an excellent term, achieving strong results across subjects. This reflects great dedication and a positive attitude towards learning. We encourage ${firstName} to maintain this momentum into the next term.`;
  }
  if (avg !== null && avg >= 50) {
    return `${firstName} has had a satisfactory term with solid performance in several areas. With consistent effort and targeted revision, there is clear potential for further improvement in the term ahead.`;
  }
  if (avg !== null) {
    return `${firstName} has faced some challenges this term. We encourage additional support and revision, particularly in weaker subjects. With focused effort, meaningful improvement is entirely achievable.`;
  }
  return `${firstName} has completed the term across ${entries.length} subject${entries.length !== 1 ? "s" : ""}. We look forward to continued progress and encourage active engagement in the term ahead.`;
}

function PrintableReport({ report }: { report: StudentReport }) {
  return (
    <div
      id="printable-report"
      className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm print:shadow-none print:border-none print:p-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#1B2B50] flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#1B2B50]">Tuition Skill</p>
            <p className="text-xs text-gray-500">Official Student Report</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-700">
            {report.termLabel}
          </p>
          <p className="text-xs text-gray-400">
            Generated: {new Date(report.generatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Student Info */}
      <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 rounded-lg p-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
            Student
          </p>
          <p className="text-base font-bold text-[#1B2B50]">
            {report.studentName}
          </p>
          <p className="text-xs text-gray-500">@{report.studentUsername}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
            Teacher
          </p>
          <p className="text-base font-bold text-[#1B2B50]">
            {report.teacherName}
          </p>
        </div>
      </div>

      {/* Grade Table */}
      <div className="mb-6">
        <p className="text-sm font-bold text-[#1B2B50] mb-3 uppercase tracking-wide">
          Subject Results
        </p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#1B2B50] text-white">
              <th className="text-left px-3 py-2 rounded-tl-lg font-semibold text-xs uppercase">
                Subject
              </th>
              <th className="text-center px-3 py-2 font-semibold text-xs uppercase">
                Grade
              </th>
              <th className="text-left px-3 py-2 rounded-tr-lg font-semibold text-xs uppercase">
                Teacher's Comment
              </th>
            </tr>
          </thead>
          <tbody>
            {report.entries.map((entry, idx) => (
              <tr
                key={entry.subject}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-3 py-2.5 font-medium text-gray-800">
                  {entry.subject}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#2BA870] text-white text-xs font-bold">
                    {entry.grade}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-gray-600 text-xs leading-relaxed">
                  {entry.aiComment}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Overall Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-xs font-bold text-[#1B2B50] uppercase tracking-wide mb-1">
          Overall Summary
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          {report.overallSummary}
        </p>
      </div>

      {/* Signature line */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <div className="border-b border-gray-300 mb-1 h-6" />
          <p className="text-xs text-gray-400">Teacher Signature</p>
        </div>
        <div>
          <div className="border-b border-gray-300 mb-1 h-6" />
          <p className="text-xs text-gray-400">Date</p>
        </div>
      </div>

      <p className="text-[10px] text-gray-300 text-center mt-6">
        Tuition Skill · Confidential Student Report · {report.termLabel}
      </p>
    </div>
  );
}

export function StudentReportAI({ teacherName, onClose }: Props) {
  const allStudents = getStudentUsers();
  const [selectedUsername, setSelectedUsername] = useState("");
  const [termLabel, setTermLabel] = useState("");
  const [generating, setGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState<StudentReport | null>(
    null,
  );
  const [viewReportId, setViewReportId] = useState<string | null>(null);

  const pastReports = getReportsByTeacher(teacherName);

  const selectedStudent = allStudents.find(
    (s) => s.username.toLowerCase() === selectedUsername.toLowerCase(),
  );

  function handleGenerate() {
    if (!selectedUsername.trim()) {
      toast.error("Please select a student.");
      return;
    }
    if (!termLabel.trim()) {
      toast.error("Please enter a term label (e.g. Term 1 2025).");
      return;
    }
    const student = allStudents.find(
      (s) => s.username.toLowerCase() === selectedUsername.toLowerCase(),
    );
    if (!student) {
      toast.error("Student not found.");
      return;
    }

    setGenerating(true);
    setTimeout(() => {
      const grades = getGradesForStudent(selectedUsername).filter(
        (g) => g.teacherName === teacherName,
      );

      const entries = grades.map((g) => ({
        subject: g.subject,
        grade: g.grade,
        aiComment: generateAiComment(g.subject, g.grade),
      }));

      const overallSummary = generateOverallSummary(student.name, entries);

      const report: StudentReport = {
        id: `report_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        studentUsername: selectedUsername.toLowerCase(),
        studentName: student.name,
        teacherName,
        generatedAt: Date.now(),
        termLabel: termLabel.trim(),
        entries,
        overallSummary,
      };

      saveStudentReport(report);
      setCurrentReport(report);
      setGenerating(false);
      toast.success(`Report generated for ${student.name}!`);
    }, 1200);
  }

  function handlePrint() {
    window.print();
  }

  const viewingReport = viewReportId
    ? (pastReports.find((r) => r.id === viewReportId) ?? null)
    : null;

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#print-overlay) { display: none !important; }
          #print-overlay { display: block !important; position: static !important; }
          #printable-report { box-shadow: none !important; }
        }
      `}</style>

      <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
        <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl my-4">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h2 className="font-bold text-base text-foreground">
                  Student Reports AI
                </h2>
                <p className="text-xs text-muted-foreground">
                  Generate printable grade reports
                </p>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Generator form */}
            <Card className="border-purple-200 bg-purple-50/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Generate New Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Select Student
                  </Label>
                  <select
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                    value={selectedUsername}
                    onChange={(e) => setSelectedUsername(e.target.value)}
                  >
                    <option value="">-- Choose a student --</option>
                    {allStudents.map((s) => (
                      <option key={s.username} value={s.username}>
                        {s.name} (@{s.username})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedStudent && (
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-purple-100">
                    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {selectedStudent.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        @{selectedStudent.username}
                      </p>
                    </div>
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {
                        getGradesForStudent(selectedUsername).filter(
                          (g) => g.teacherName === teacherName,
                        ).length
                      }{" "}
                      grades recorded
                    </span>
                  </div>
                )}

                <div>
                  <Label
                    htmlFor="term-label"
                    className="text-xs font-semibold mb-1.5 block"
                  >
                    Term Label
                  </Label>
                  <Input
                    id="term-label"
                    placeholder="e.g. Term 1 2025 / Spring Term"
                    value={termLabel}
                    onChange={(e) => setTermLabel(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
                >
                  {generating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated report preview */}
            {currentReport && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    Report Preview
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePrint}
                    className="gap-1.5 text-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Report
                  </Button>
                </div>
                <PrintableReport report={currentReport} />
              </div>
            )}

            {/* Past reports */}
            {pastReports.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  Previous Reports
                </p>
                <div className="space-y-1.5">
                  {pastReports.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between bg-card border border-border/60 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {r.studentName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {r.termLabel} ·{" "}
                            {new Date(r.generatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs gap-1"
                        onClick={() => setViewReportId(r.id)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View past report dialog */}
      <Dialog
        open={viewReportId !== null}
        onOpenChange={(o) => !o && setViewReportId(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Report</DialogTitle>
          </DialogHeader>
          {viewingReport && (
            <div className="space-y-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrint}
                className="gap-1.5 text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Report
              </Button>
              <PrintableReport report={viewingReport} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
