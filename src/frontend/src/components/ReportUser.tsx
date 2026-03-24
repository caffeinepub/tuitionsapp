import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ChevronLeft, Flag, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getAssignments } from "../utils/assignmentStorage";
import { getStudentUsers } from "../utils/studentStorage";
import { submitReport } from "../utils/supportStorage";

type Props = {
  reporterRole: "student" | "teacher" | "parent";
  reporterName: string;
  onClose: () => void;
};

type UserType = "student" | "teacher" | "parent";

export function ReportUser({ reporterRole, reporterName, onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [selectedStudentUsername, setSelectedStudentUsername] = useState("");
  const [manualName, setManualName] = useState("");
  const [reason, setReason] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const students = getStudentUsers();
  const teachers = Array.from(
    new Set(
      getAssignments()
        .map((a) => a.teacherName)
        .filter(Boolean),
    ),
  );

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.username.toLowerCase().includes(studentSearch.toLowerCase()),
  );

  function handleSelectType(type: UserType) {
    setSelectedType(type);
    setStep(2);
    setSelectedStudentUsername("");
    setManualName("");
    setStudentSearch("");
  }

  function getReportedName(): string {
    if (selectedType === "student") {
      const s = students.find((u) => u.username === selectedStudentUsername);
      return s ? s.name : selectedStudentUsername;
    }
    return manualName.trim();
  }

  function handleSubmit() {
    const reportedName = getReportedName();
    if (!reportedName) {
      toast.error("Please select or enter the user to report.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason for the report.");
      return;
    }
    if (!selectedType) return;
    setSubmitting(true);
    submitReport(
      reporterRole,
      reporterName,
      selectedType,
      reportedName,
      reason.trim(),
    );
    toast.success("Report submitted. Admin will review it.");
    setSubmitting(false);
    onClose();
  }

  const userTypeOptions: {
    type: UserType;
    label: string;
    emoji: string;
    desc: string;
  }[] = [
    {
      type: "student",
      label: "Student",
      emoji: "🎓",
      desc: "Report a student",
    },
    {
      type: "teacher",
      label: "Teacher",
      emoji: "📚",
      desc: "Report a teacher",
    },
    {
      type: "parent",
      label: "Parent",
      emoji: "👨‍👩‍👧",
      desc: "Report a parent",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      data-ocid="report.modal"
    >
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-7 h-7 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
                data-ocid="report.back_button"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
            )}
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
              <Flag className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-foreground">
                Report a User
              </h2>
              <p className="text-xs text-muted-foreground">
                {step === 1
                  ? "Select user type"
                  : `Reporting a ${selectedType}`}
              </p>
            </div>
          </div>
          <Button
            data-ocid="report.close_button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4">
          {step === 1 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                Who do you want to report?
              </p>
              {userTypeOptions.map(({ type, label, emoji, desc }) => (
                <button
                  key={type}
                  type="button"
                  data-ocid={`report.type.${type}.button`}
                  onClick={() => handleSelectType(type)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all text-left group"
                >
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="font-semibold text-sm text-foreground group-hover:text-orange-700 dark:group-hover:text-orange-400">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Select user */}
              {selectedType === "student" && (
                <div>
                  <label
                    htmlFor="report-student-search"
                    className="text-xs font-semibold text-muted-foreground block mb-1.5"
                  >
                    Select Student
                  </label>
                  <Input
                    id="report-student-search"
                    data-ocid="report.search.input"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by name or username..."
                    className="text-sm mb-2"
                  />
                  <div className="max-h-36 overflow-y-auto space-y-1 border border-border rounded-lg p-1">
                    {filteredStudents.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-3">
                        No students found.
                      </p>
                    ) : (
                      filteredStudents.map((s) => (
                        <button
                          key={s.username}
                          type="button"
                          data-ocid="report.student.select"
                          onClick={() => setSelectedStudentUsername(s.username)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedStudentUsername === s.username
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          <span className="font-medium">{s.name}</span>
                          <span className="text-xs opacity-70 ml-2">
                            @{s.username}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {selectedType === "teacher" && (
                <div>
                  <label
                    htmlFor="report-teacher-name"
                    className="text-xs font-semibold text-muted-foreground block mb-1.5"
                  >
                    Teacher Name
                  </label>
                  {teachers.length > 0 ? (
                    <div className="max-h-32 overflow-y-auto space-y-1 border border-border rounded-lg p-1 mb-2">
                      {teachers.map((name) => (
                        <button
                          key={name}
                          type="button"
                          data-ocid="report.teacher.select"
                          onClick={() => setManualName(name)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            manualName === name
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <Input
                    id="report-teacher-name"
                    data-ocid="report.teacher.name.input"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Or type teacher name..."
                    className="text-sm"
                  />
                </div>
              )}

              {selectedType === "parent" && (
                <div>
                  <label
                    htmlFor="report-parent-name"
                    className="text-xs font-semibold text-muted-foreground block mb-1.5"
                  >
                    Parent Name
                  </label>
                  <Input
                    id="report-parent-name"
                    data-ocid="report.parent.name.input"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Enter parent name..."
                    className="text-sm"
                  />
                </div>
              )}

              {/* Reason */}
              <div>
                <label
                  htmlFor="report-reason"
                  className="text-xs font-semibold text-muted-foreground block mb-1.5"
                >
                  Reason for Report
                </label>
                <Textarea
                  id="report-reason"
                  data-ocid="report.reason.textarea"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe why you are reporting this user..."
                  className="text-sm resize-none h-20"
                />
              </div>

              <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg p-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                <p className="text-xs text-orange-700 dark:text-orange-400">
                  False reports may result in action against your account.
                </p>
              </div>

              <Button
                data-ocid="report.submit_button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold gap-2"
              >
                <Flag className="w-4 h-4" />
                Submit Report
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
