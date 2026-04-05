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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Check,
  Edit3,
  FileText,
  GraduationCap,
  PenTool,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getGradesForStudent } from "../utils/assignmentStorage";
import {
  type StudentReport,
  getReportsByTeacher,
  saveStudentReport,
  updateStudentReport,
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
  return `${firstName} has completed the term across ${entries.length} subject${
    entries.length !== 1 ? "s" : ""
  }. We look forward to continued progress and encourage active engagement in the term ahead.`;
}

// Signature display inside printable report
function SignatureDisplay({ sig }: { sig?: string }) {
  if (!sig) {
    return <div className="border-b border-gray-300 mb-1 h-8" />;
  }
  if (sig.startsWith("typed:")) {
    const typed = sig.slice(6);
    return (
      <div className="h-8 flex items-end pb-1 border-b border-gray-300">
        <span
          style={{
            fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
            fontSize: "1.4rem",
            color: "#1B2B50",
          }}
        >
          {typed}
        </span>
      </div>
    );
  }
  // base64 image
  return (
    <div className="h-12 border-b border-gray-300 flex items-end pb-1">
      <img
        src={sig}
        alt="Teacher signature"
        className="max-h-10 max-w-[200px] object-contain"
      />
    </div>
  );
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
          {report.editedAt && (
            <p className="text-xs text-gray-400">
              Edited: {new Date(report.editedAt).toLocaleDateString()}
            </p>
          )}
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
          <SignatureDisplay sig={report.teacherSignature} />
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

// Signature Pad component
function SignaturePad({
  onSave,
  existing,
}: {
  onSave: (sig: string) => void;
  existing?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [typedName, setTypedName] = useState(
    existing?.startsWith("typed:") ? existing.slice(6) : "",
  );
  const [activeTab, setActiveTab] = useState(
    existing && !existing.startsWith("typed:") ? "draw" : "type",
  );

  // Initialize canvas with existing drawn sig
  useEffect(() => {
    if (activeTab === "draw" && existing && !existing.startsWith("typed:")) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = existing;
    }
  }, [activeTab, existing]);

  function getPos(
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement,
  ) {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setDrawing(true);
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1B2B50";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  function stopDraw() {
    setDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function saveDraw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  }

  function saveTyped() {
    if (!typedName.trim()) return;
    onSave(`typed:${typedName.trim()}`);
  }

  return (
    <div className="space-y-3">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="draw" className="flex-1 gap-1.5">
            <PenTool className="w-3.5 h-3.5" />
            Draw
          </TabsTrigger>
          <TabsTrigger value="type" className="flex-1 gap-1.5">
            <Edit3 className="w-3.5 h-3.5" />
            Type
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="mt-3">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Draw your signature below:
            </p>
            <canvas
              ref={canvasRef}
              width={300}
              height={100}
              className="border border-dashed border-border rounded-lg bg-white cursor-crosshair touch-none w-full"
              style={{ maxWidth: 300, height: 100 }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={clearCanvas}
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                className="text-xs bg-[#1B2B50] hover:bg-[#1B2B50]/90 text-white gap-1"
                onClick={saveDraw}
              >
                <Check className="w-3 h-3" />
                Save Signature
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="type" className="mt-3">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Type your name as a signature:
            </p>
            <Input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Your full name"
              className="h-9 text-sm"
            />
            {typedName && (
              <div className="bg-white border border-border/60 rounded-lg px-4 py-3">
                <span
                  style={{
                    fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                    fontSize: "1.5rem",
                    color: "#1B2B50",
                  }}
                >
                  {typedName}
                </span>
              </div>
            )}
            <Button
              type="button"
              size="sm"
              disabled={!typedName.trim()}
              className="text-xs bg-[#1B2B50] hover:bg-[#1B2B50]/90 text-white gap-1"
              onClick={saveTyped}
            >
              <Check className="w-3 h-3" />
              Save Signature
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Edit mode for a report
function EditReportPanel({
  report,
  onSave,
  onCancel,
}: {
  report: StudentReport;
  onSave: (updated: StudentReport) => void;
  onCancel: () => void;
}) {
  const [termLabel, setTermLabel] = useState(report.termLabel);
  const [entries, setEntries] = useState(report.entries.map((e) => ({ ...e })));
  const [overallSummary, setOverallSummary] = useState(report.overallSummary);

  function handleSave() {
    onSave({
      ...report,
      termLabel: termLabel.trim() || report.termLabel,
      entries,
      overallSummary,
      editedAt: Date.now(),
    });
  }

  return (
    <div className="space-y-4 border border-blue-200 bg-blue-50/30 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Edit3 className="w-4 h-4 text-blue-600" />
          Edit Report
        </p>
        <Button size="sm" variant="ghost" onClick={onCancel} className="h-7">
          Cancel
        </Button>
      </div>

      <div>
        <Label className="text-xs font-semibold mb-1.5 block">Term Label</Label>
        <Input
          value={termLabel}
          onChange={(e) => setTermLabel(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      {entries.length > 0 && (
        <div>
          <Label className="text-xs font-semibold mb-1.5 block">
            Subject Comments
          </Label>
          <div className="space-y-2">
            {entries.map((entry, idx) => (
              <div
                key={entry.subject}
                className="bg-white rounded-lg border border-border/60 p-3"
              >
                <p className="text-xs font-bold text-[#1B2B50] mb-1">
                  {entry.subject}{" "}
                  <span className="text-[#2BA870] font-semibold">
                    ({entry.grade})
                  </span>
                </p>
                <Textarea
                  value={entry.aiComment}
                  onChange={(e) => {
                    const updated = entries.map((en, i) =>
                      i === idx ? { ...en, aiComment: e.target.value } : en,
                    );
                    setEntries(updated);
                  }}
                  className="text-xs min-h-[60px] resize-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label className="text-xs font-semibold mb-1.5 block">
          Overall Summary
        </Label>
        <Textarea
          value={overallSummary}
          onChange={(e) => setOverallSummary(e.target.value)}
          className="text-xs min-h-[80px] resize-none"
        />
      </div>

      <Button
        size="sm"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
        onClick={handleSave}
      >
        <Check className="w-3.5 h-3.5" />
        Save Changes
      </Button>
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
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [showSignatureFor, setShowSignatureFor] = useState<string | null>(null);
  const [pastReports, setPastReports] = useState<StudentReport[]>(() =>
    getReportsByTeacher(teacherName),
  );

  function refreshReports() {
    setPastReports(getReportsByTeacher(teacherName));
  }

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
      refreshReports();
      toast.success(`Report generated for ${student.name}!`);
    }, 1200);
  }

  function handleEditSave(updated: StudentReport) {
    updateStudentReport(updated);
    refreshReports();
    setEditingReportId(null);
    // if editing current report, update it
    if (currentReport && currentReport.id === updated.id) {
      setCurrentReport(updated);
    }
    toast.success("Report updated.");
  }

  function handleSignatureSave(reportId: string, sig: string) {
    const all = getReportsByTeacher(teacherName);
    const report = all.find((r) => r.id === reportId);
    if (!report) return;
    const updated = { ...report, teacherSignature: sig, editedAt: Date.now() };
    updateStudentReport(updated);
    refreshReports();
    setShowSignatureFor(null);
    if (currentReport && currentReport.id === reportId) {
      setCurrentReport(updated);
    }
    toast.success("Signature saved.");
  }

  function handleSendReport(report: StudentReport) {
    const updated = { ...report, sent: true, sentAt: Date.now() };
    updateStudentReport(updated);
    refreshReports();
    if (currentReport && currentReport.id === report.id) {
      setCurrentReport(updated);
    }
    toast.success(`Report sent to ${report.studentName}!`);
  }

  // Get latest version from pastReports or currentReport
  function getLatestReport(id: string): StudentReport | null {
    return pastReports.find((r) => r.id === id) ?? null;
  }

  const viewingReport = viewReportId ? getLatestReport(viewReportId) : null;
  const editingReport = editingReportId
    ? (getLatestReport(editingReportId) ??
      (currentReport?.id === editingReportId ? currentReport : null))
    : null;

  // Active display report (for current report section)
  const displayCurrentReport = currentReport
    ? (pastReports.find((r) => r.id === currentReport.id) ?? currentReport)
    : null;

  return (
    <>
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
                  Generate and manage student grade reports
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
            {displayCurrentReport && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    Report Preview
                  </p>
                  <div className="flex items-center gap-2">
                    {/* Send button */}
                    {displayCurrentReport.sent ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2BA870] bg-green-50 border border-green-200 rounded-full px-3 py-1">
                        <Check className="w-3 h-3" />
                        Sent ✓
                        {displayCurrentReport.sentAt && (
                          <span className="text-muted-foreground font-normal ml-1">
                            {new Date(
                              displayCurrentReport.sentAt,
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        data-ocid="report.send_button"
                        className="gap-1.5 text-xs bg-[#2BA870] hover:bg-[#2BA870]/90 text-white"
                        onClick={() => handleSendReport(displayCurrentReport)}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send to Student
                      </Button>
                    )}
                    {/* Edit button */}
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid="report.edit_button"
                      className="gap-1.5 text-xs"
                      onClick={() =>
                        setEditingReportId(displayCurrentReport.id)
                      }
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Edit panel for current report */}
                {editingReportId === displayCurrentReport.id &&
                  editingReport && (
                    <EditReportPanel
                      report={editingReport}
                      onSave={handleEditSave}
                      onCancel={() => setEditingReportId(null)}
                    />
                  )}

                <PrintableReport report={displayCurrentReport} />

                {/* Signature section */}
                <div className="border border-border/60 rounded-xl p-4 bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <PenTool className="w-4 h-4 text-muted-foreground" />
                      Teacher Signature
                    </p>
                    {displayCurrentReport.teacherSignature && (
                      <span className="text-xs text-[#2BA870] font-semibold">
                        ✓ Signed
                      </span>
                    )}
                  </div>
                  {showSignatureFor === displayCurrentReport.id ? (
                    <SignaturePad
                      existing={displayCurrentReport.teacherSignature}
                      onSave={(sig) =>
                        handleSignatureSave(displayCurrentReport.id, sig)
                      }
                    />
                  ) : (
                    <>
                      {displayCurrentReport.teacherSignature && (
                        <div className="bg-white rounded-lg border border-border/40 px-4 py-3">
                          <SignatureDisplay
                            sig={displayCurrentReport.teacherSignature}
                          />
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        data-ocid="report.signature_button"
                        className="gap-1.5 text-xs"
                        onClick={() =>
                          setShowSignatureFor(displayCurrentReport.id)
                        }
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        {displayCurrentReport.teacherSignature
                          ? "Update Signature"
                          : "Add Signature"}
                      </Button>
                    </>
                  )}
                </div>
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
                        {/* Sent/Draft badge */}
                        {r.sent ? (
                          <span className="text-[10px] font-semibold text-[#2BA870] bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                            Sent
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-muted-foreground bg-muted border border-border/60 rounded-full px-2 py-0.5">
                            Draft
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs gap-1"
                          onClick={() => setViewReportId(r.id)}
                        >
                          View
                        </Button>
                      </div>
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
        onOpenChange={(o) => {
          if (!o) {
            setViewReportId(null);
            setEditingReportId(null);
            setShowSignatureFor(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Report</DialogTitle>
          </DialogHeader>
          {viewingReport && (
            <div className="space-y-3">
              {/* Edit / Send buttons for past report */}
              <div className="flex items-center gap-2">
                {viewingReport.sent ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2BA870] bg-green-50 border border-green-200 rounded-full px-3 py-1">
                    <Check className="w-3 h-3" />
                    Sent ✓
                    {viewingReport.sentAt && (
                      <span className="text-muted-foreground font-normal ml-1">
                        {new Date(viewingReport.sentAt).toLocaleDateString()}
                      </span>
                    )}
                  </span>
                ) : (
                  <Button
                    size="sm"
                    data-ocid="report.dialog.send_button"
                    className="gap-1.5 text-xs bg-[#2BA870] hover:bg-[#2BA870]/90 text-white"
                    onClick={() => {
                      handleSendReport(viewingReport);
                      setViewReportId(null);
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send to Student
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  data-ocid="report.dialog.edit_button"
                  className="gap-1.5 text-xs"
                  onClick={() => setEditingReportId(viewingReport.id)}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Report
                </Button>
              </div>

              {/* Edit panel in dialog */}
              {editingReportId === viewingReport.id && editingReport && (
                <EditReportPanel
                  report={editingReport}
                  onSave={(updated) => {
                    handleEditSave(updated);
                    setViewReportId(updated.id);
                  }}
                  onCancel={() => setEditingReportId(null)}
                />
              )}

              <PrintableReport report={viewingReport} />

              {/* Signature section in dialog */}
              <div className="border border-border/60 rounded-xl p-4 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-muted-foreground" />
                    Teacher Signature
                  </p>
                  {viewingReport.teacherSignature && (
                    <span className="text-xs text-[#2BA870] font-semibold">
                      ✓ Signed
                    </span>
                  )}
                </div>
                {showSignatureFor === viewingReport.id ? (
                  <SignaturePad
                    existing={viewingReport.teacherSignature}
                    onSave={(sig) => {
                      handleSignatureSave(viewingReport.id, sig);
                      setViewReportId(viewingReport.id);
                    }}
                  />
                ) : (
                  <>
                    {viewingReport.teacherSignature && (
                      <div className="bg-white rounded-lg border border-border/40 px-4 py-3">
                        <SignatureDisplay
                          sig={viewingReport.teacherSignature}
                        />
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid="report.dialog.signature_button"
                      className="gap-1.5 text-xs"
                      onClick={() => setShowSignatureFor(viewingReport.id)}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      {viewingReport.teacherSignature
                        ? "Update Signature"
                        : "Add Signature"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
