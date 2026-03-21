import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  BarChart2,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ClipboardList,
  Clock,
  GraduationCap,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Trash2,
  User,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type Assignment,
  type CallBooking,
  type ScheduledSession,
  deleteAssignment,
  deleteScheduledSession,
  getAssignments,
  getCallBookings,
  getScheduledSessions,
  getUnreadCount,
  markBookingCompleted,
  markChatRead,
  saveAssignment,
  saveGrade,
  saveScheduledSession,
} from "../utils/assignmentStorage";
import {
  type Quiz,
  type QuizAssignment,
  deleteQuiz,
  deleteQuizAssignment,
  getQuizAssignments,
  getQuizzes,
  getSubmissionsForQuiz,
  saveQuiz,
  updateQuiz,
} from "../utils/quizStorage";
import {
  type TeacherProfile,
  addTeacherAward,
  getTeacherProfile,
  registerTeacherName,
  removeTeacherAward,
  updateTeacherProfilePicture,
} from "../utils/teacherProfileStorage";
import { ChatWindow } from "./ChatWindow";
import { DashboardNav } from "./DashboardNav";
import { QuizBuilder } from "./QuizBuilder";
import { QuizResults } from "./QuizResults";

type Props = {
  onLogout: () => void;
};

// Teacher name stored in session for this login (persisted in localStorage)
const TEACHER_NAME_KEY = "tuitions_teacher_name";

function getTeacherName(): string {
  return localStorage.getItem(TEACHER_NAME_KEY) ?? "";
}
function setTeacherName(name: string): void {
  localStorage.setItem(TEACHER_NAME_KEY, name);
}

export function TeacherDashboard({ onLogout }: Props) {
  const [teacherName, setTeacherNameState] = useState(() => getTeacherName());
  const [activeChatBookingId, setActiveChatBookingId] = useState<string | null>(
    null,
  );
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [nameDialogOpen, setNameDialogOpen] = useState(
    () => getTeacherName() === "",
  );
  const [nameInput, setNameInput] = useState("");
  const [dobInput, setDobInput] = useState("");

  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    getAssignments().filter((a) => a.teacherName === getTeacherName()),
  );
  const [bookings, setBookings] = useState<CallBooking[]>(() =>
    getCallBookings().filter((b) => b.teacherName === getTeacherName()),
  );
  const [scheduledSessions, setScheduledSessions] = useState<
    ScheduledSession[]
  >(() =>
    getScheduledSessions().filter((s) => s.teacherName === getTeacherName()),
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newDue, setNewDue] = useState("");

  // Session form fields
  const [sessionSubject, setSessionSubject] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");

  // Grade dialog
  const [gradeBooking, setGradeBooking] = useState<CallBooking | null>(null);
  const [gradeValue, setGradeValue] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");

  // --- Profile state ---
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<TeacherProfile>(() => {
    const name = getTeacherName();
    return name ? getTeacherProfile(name) : { principal: "", awards: [] };
  });
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Award form
  const [awardTitle, setAwardTitle] = useState("");
  const [awardYear, setAwardYear] = useState("");
  const [awardDesc, setAwardDesc] = useState("");

  // Quiz & Test Builder state
  const [quizzes, setQuizzes] = useState<Quiz[]>(() =>
    getQuizzes().filter((q) => q.teacherName === getTeacherName()),
  );
  const [quizBuilderOpen, setQuizBuilderOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [quizResultsQuiz, setQuizResultsQuiz] = useState<Quiz | null>(null);
  const [quizSectionOpen, setQuizSectionOpen] = useState(true);

  // Refresh bookings when window gets focus (student may have booked)
  useEffect(() => {
    function refresh() {
      const name = getTeacherName();
      setAssignments(getAssignments().filter((a) => a.teacherName === name));
      setBookings(getCallBookings().filter((b) => b.teacherName === name));
      setScheduledSessions(
        getScheduledSessions().filter((s) => s.teacherName === name),
      );
      setQuizzes(getQuizzes().filter((q) => q.teacherName === name));
    }
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  // Poll unread message counts every 1.5s so teacher sees badge when student messages
  useEffect(() => {
    function refreshUnread() {
      const bks = getCallBookings().filter(
        (b) => b.teacherName === getTeacherName(),
      );
      const counts: Record<string, number> = {};
      for (const b of bks) {
        counts[b.id] = getUnreadCount(b.id, "teacher");
      }
      setUnreadCounts(counts);
    }
    refreshUnread();
    const timer = setInterval(refreshUnread, 1500);
    return () => clearInterval(timer);
  }, []);

  function handleSaveName() {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      toast.error("Please enter your name.");
      return;
    }
    if (!dobInput) {
      toast.error("Please enter your date of birth.");
      return;
    }
    const today = new Date();
    const dob = new Date(dobInput);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    if (age < 18) {
      toast.error(
        "You must be at least 18 years old to register as a teacher.",
      );
      return;
    }
    setTeacherName(trimmed);
    setTeacherNameState(trimmed);
    setNameDialogOpen(false);
    // Register name->principal mapping so parents can look up profile
    registerTeacherName(trimmed, trimmed);
    // Load profile for this teacher
    setProfile(getTeacherProfile(trimmed));
    // Load assignments for this teacher
    setAssignments(getAssignments().filter((a) => a.teacherName === trimmed));
    setBookings(getCallBookings().filter((b) => b.teacherName === trimmed));
    setScheduledSessions(
      getScheduledSessions().filter((s) => s.teacherName === trimmed),
    );
  }

  // Register name when teacherName is already set (returning teacher)
  useEffect(() => {
    if (teacherName) {
      registerTeacherName(teacherName, teacherName);
      setProfile(getTeacherProfile(teacherName));
    }
  }, [teacherName]);

  // --- Profile handlers ---
  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateTeacherProfilePicture(teacherName, dataUrl);
      setProfile(getTeacherProfile(teacherName));
      toast.success("Profile picture updated!");
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function handleRemovePhoto() {
    updateTeacherProfilePicture(teacherName, undefined);
    setProfile(getTeacherProfile(teacherName));
    toast.success("Profile picture removed.");
  }

  function handleAddAward() {
    if (!awardTitle.trim()) {
      toast.error("Award title is required.");
      return;
    }
    addTeacherAward(teacherName, {
      title: awardTitle.trim(),
      year: awardYear.trim() || undefined,
      description: awardDesc.trim() || undefined,
    });
    setProfile(getTeacherProfile(teacherName));
    setAwardTitle("");
    setAwardYear("");
    setAwardDesc("");
    toast.success("Award added!");
  }

  function handleRemoveAward(awardId: string) {
    removeTeacherAward(teacherName, awardId);
    setProfile(getTeacherProfile(teacherName));
    toast.success("Award removed.");
  }

  const handleCreateAssignment = () => {
    if (!newTitle.trim() || !newSubject.trim() || !newDue.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    const newItem: Assignment = {
      id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: newTitle.trim(),
      subject: newSubject.trim(),
      due: newDue.trim(),
      teacherName: teacherName,
      createdAt: Date.now(),
    };
    saveAssignment(newItem);
    setAssignments((prev) => [newItem, ...prev]);
    setNewTitle("");
    setNewSubject("");
    setNewDue("");
    setCreateOpen(false);
    toast.success("Assignment created successfully!");
  };

  function handleDeleteAssignment(id: string) {
    deleteAssignment(id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    toast.success("Assignment deleted.");
  }

  function clearSessionForm() {
    setSessionSubject("");
    setSessionDate("");
    setSessionTime("");
    setSessionNotes("");
  }

  function handleScheduleSession() {
    if (!sessionSubject.trim() || !sessionDate.trim() || !sessionTime.trim()) {
      toast.error("Please fill in Subject, Date, and Time.");
      return;
    }
    const newSession: ScheduledSession = {
      id: `sess_${Date.now()}`,
      teacherName: getTeacherName(),
      subject: sessionSubject.trim(),
      date: sessionDate.trim(),
      time: sessionTime.trim(),
      notes: sessionNotes.trim(),
      createdAt: Date.now(),
    };
    saveScheduledSession(newSession);
    setScheduledSessions((prev) => [newSession, ...prev]);
    clearSessionForm();
    setSessionOpen(false);
    toast.success("Session scheduled!");
  }

  function handleDeleteSession(id: string) {
    deleteScheduledSession(id);
    setScheduledSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Session removed.");
  }

  function openGradeDialog(b: CallBooking) {
    setGradeBooking(b);
    setGradeValue("");
    setGradeFeedback("");
  }

  function submitGrade() {
    if (!gradeBooking) return;
    if (!gradeValue.trim()) {
      toast.error("Please enter a grade.");
      return;
    }
    saveGrade({
      id: `g_${Date.now()}`,
      bookingId: gradeBooking.id,
      assignmentId: gradeBooking.assignmentId,
      assignmentTitle: gradeBooking.assignmentTitle,
      studentUsername: gradeBooking.studentUsername,
      studentName: gradeBooking.studentName,
      teacherName: teacherName,
      subject: gradeBooking.subject,
      grade: gradeValue.trim(),
      feedback: gradeFeedback.trim(),
      gradedAt: Date.now(),
    });
    markBookingCompleted(gradeBooking.id);
    setBookings((prev) =>
      prev.map((b) =>
        b.id === gradeBooking.id ? { ...b, status: "completed" } : b,
      ),
    );
    toast.success(
      `Grade "${gradeValue.trim()}" given to ${gradeBooking.studentName}.`,
    );
    setGradeBooking(null);
    setGradeValue("");
    setGradeFeedback("");
  }

  // --- Quiz handlers ---
  function handleQuizSaved(_quiz: Quiz) {
    const name = getTeacherName();
    setQuizzes(getQuizzes().filter((q) => q.teacherName === name));
    setQuizBuilderOpen(false);
    setEditingQuiz(null);
  }

  function handleDeleteQuiz(id: string) {
    // Remove quiz + all its assignments
    const assignments = getQuizAssignments().filter((a) => a.quizId === id);
    for (const a of assignments) deleteQuizAssignment(a.id);
    deleteQuiz(id);
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const completedBookings = bookings.filter((b) => b.status === "completed");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Teacher name setup dialog */}
      <Dialog
        open={nameDialogOpen}
        onOpenChange={() => {
          /* prevent close without saving */
        }}
      >
        <DialogContent
          data-ocid="teacher.name.dialog"
          className="sm:max-w-sm"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Welcome, Teacher!
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Please enter your name. Students will see this when browsing
            assignments.
          </p>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="teacher-name-input">Your Name</Label>
            <Input
              id="teacher-name-input"
              data-ocid="teacher.name.input"
              placeholder="e.g. Mr. Robert Hayes"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            />
          </div>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="teacher-dob-input">Date of Birth</Label>
            <Input
              id="teacher-dob-input"
              data-ocid="teacher.dob.input"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              value={dobInput}
              onChange={(e) => setDobInput(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              data-ocid="teacher.name.submit_button"
              onClick={handleSaveName}
              className="bg-teacher hover:bg-teacher/90 text-white w-full"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DashboardNav
        userRole="Teacher"
        onLogout={onLogout}
        headerClass="dashboard-header-teacher"
      />

      {/* Welcome banner */}
      <div className="dashboard-header-teacher px-4 sm:px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Good day
            {teacherName ? `, ${teacherName.split(" ").slice(-1)[0]}` : ""}! 📚
          </h1>
          <p className="text-white/70 text-sm">
            Manage your classes and assignments below.
          </p>
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full -mt-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={BookOpen}
            label="Active Classes"
            value="—"
            color="text-teacher"
            bg="bg-teacher-light"
          />
          <StatCard
            icon={Users}
            label="Total Students"
            value="—"
            color="text-student"
            bg="bg-student-light"
          />
          <StatCard
            icon={ClipboardList}
            label="Assignments"
            value={String(assignments.length)}
            color="text-parent"
            bg="bg-parent-light"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            data-ocid="teacher.create.assignment.button"
            onClick={() => setCreateOpen(true)}
            className="bg-teacher hover:bg-teacher/90 text-white font-semibold gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Assignment
          </Button>
          <Button
            data-ocid="teacher.create.session.button"
            variant="outline"
            onClick={() => setSessionOpen(true)}
            className="font-semibold gap-2 border-teacher/30 text-teacher hover:bg-teacher-light"
          >
            <Calendar className="w-4 h-4" />
            Schedule Session
          </Button>
        </div>

        {/* My Profile (collapsible) */}
        <section className="mb-8">
          <button
            type="button"
            data-ocid="teacher.profile.toggle"
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 w-full mb-4 group"
          >
            <h2 className="font-display text-xl font-bold text-foreground">
              My Profile
            </h2>
            <span className="text-xs text-muted-foreground font-normal ml-1">
              (optional)
            </span>
            {profileOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground transition-colors" />
            )}
          </button>

          {profileOpen && (
            <Card className="border-border/60 shadow-xs">
              <CardContent className="p-6 space-y-6">
                {/* Profile Picture */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-teacher" />
                    Profile Picture
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-teacher-light flex items-center justify-center flex-shrink-0 border-2 border-teacher/20">
                      {profile.profilePicture ? (
                        <img
                          src={profile.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-teacher/60" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />
                      <Button
                        data-ocid="teacher.profile.upload_button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-teacher/30 text-teacher hover:bg-teacher-light"
                        onClick={() => photoInputRef.current?.click()}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        {profile.profilePicture
                          ? "Change Photo"
                          : "Upload Photo"}
                      </Button>
                      {profile.profilePicture && (
                        <Button
                          data-ocid="teacher.profile.delete_button"
                          size="sm"
                          variant="ghost"
                          className="gap-1.5 text-muted-foreground hover:text-destructive"
                          onClick={handleRemovePhoto}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/60" />

                {/* Awards */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-teacher" />
                    Awards &amp; Achievements
                  </p>

                  {/* Existing awards */}
                  {profile.awards.length === 0 ? (
                    <p className="text-xs text-muted-foreground mb-4">
                      No awards added yet. Add your first award below.
                    </p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {profile.awards.map((aw, idx) => (
                        <div
                          key={aw.id}
                          className="flex items-start justify-between gap-3 bg-muted/40 rounded-lg px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {aw.title}
                              {aw.year && (
                                <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                                  ({aw.year})
                                </span>
                              )}
                            </p>
                            {aw.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {aw.description}
                              </p>
                            )}
                          </div>
                          <Button
                            data-ocid={`teacher.award.delete_button.${idx + 1}`}
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveAward(aw.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add award form */}
                  <div className="bg-muted/20 rounded-xl border border-border/50 p-4 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Add Award
                    </p>
                    <div className="space-y-1.5">
                      <Label htmlFor="award-title" className="text-xs">
                        Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="award-title"
                        placeholder="e.g. Best Teacher of the Year"
                        value={awardTitle}
                        onChange={(e) => setAwardTitle(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="award-year" className="text-xs">
                          Year{" "}
                          <span className="text-muted-foreground font-normal">
                            (optional)
                          </span>
                        </Label>
                        <Input
                          id="award-year"
                          placeholder="e.g. 2022"
                          value={awardYear}
                          onChange={(e) => setAwardYear(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="award-desc" className="text-xs">
                        Description{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="award-desc"
                        placeholder="Brief description of the award"
                        value={awardDesc}
                        onChange={(e) => setAwardDesc(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <Button
                      data-ocid="teacher.award.submit_button"
                      size="sm"
                      onClick={handleAddAward}
                      className="bg-teacher hover:bg-teacher/90 text-white gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Save Award
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Scheduled Sessions */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Scheduled Sessions
          </h2>
          {scheduledSessions.length === 0 ? (
            <div
              data-ocid="teacher.sessions.list"
              className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center"
            >
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium text-muted-foreground">
                No sessions scheduled yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Use "Schedule Session" above to add a session.
              </p>
            </div>
          ) : (
            <div
              data-ocid="teacher.sessions.list"
              className="bg-card rounded-xl border border-border/60 shadow-xs divide-y divide-border/60"
            >
              {scheduledSessions.map((s, i) => (
                <div
                  key={s.id}
                  data-ocid={`teacher.sessions.item.${i + 1}`}
                  className="flex items-center justify-between px-4 py-3.5 gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-teacher-light flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-teacher" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {s.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.date} at {s.time}
                        {s.notes ? ` — ${s.notes}` : ""}
                      </p>
                    </div>
                  </div>
                  <Button
                    data-ocid={`teacher.sessions.delete_button.${i + 1}`}
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={() => handleDeleteSession(s.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quiz & Test Builder */}
        <section className="mb-8">
          <button
            type="button"
            data-ocid="teacher.quiz.section.toggle"
            onClick={() => setQuizSectionOpen((o) => !o)}
            className="flex items-center gap-2 w-full mb-4 group"
          >
            <ClipboardCheck className="w-5 h-5 text-teacher" />
            <h2 className="font-display text-xl font-bold text-foreground">
              Quiz &amp; Test Builder
            </h2>
            {quizSectionOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground transition-colors" />
            )}
          </button>

          {quizSectionOpen && (
            <div className="space-y-3">
              <Button
                data-ocid="teacher.quiz.create.button"
                onClick={() => {
                  setEditingQuiz(null);
                  setQuizBuilderOpen(true);
                }}
                className="bg-teacher hover:bg-teacher/90 text-white gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Create Quiz / Test
              </Button>

              {quizzes.length === 0 ? (
                <div
                  data-ocid="teacher.quiz.empty_state"
                  className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center"
                >
                  <ClipboardCheck className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No quizzes or tests created yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create your first quiz or test above.
                  </p>
                </div>
              ) : (
                <div
                  data-ocid="teacher.quiz.list"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {quizzes.map((quiz, i) => {
                    const assignmentCount = getQuizAssignments().filter(
                      (a) => a.quizId === quiz.id,
                    ).length;
                    const submissionCount = getSubmissionsForQuiz(
                      quiz.id,
                    ).length;
                    return (
                      <div
                        key={quiz.id}
                        data-ocid={`teacher.quiz.item.${i + 1}`}
                        className="bg-card border border-border/60 rounded-xl p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground leading-snug">
                              {quiz.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {quiz.subject} · {quiz.gradeLevel}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs flex-shrink-0 ${quiz.type === "test" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
                          >
                            {quiz.type === "test" ? "Test" : "Quiz"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="text-[10px]">
                            {quiz.questions.length} questions
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {assignmentCount} assigned
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {submissionCount} submissions
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-auto">
                          <Button
                            data-ocid={`teacher.quiz.edit_button.${i + 1}`}
                            size="sm"
                            variant="outline"
                            className="gap-1.5 flex-1 text-xs h-8 border-teacher/30 text-teacher hover:bg-teacher-light"
                            onClick={() => {
                              setEditingQuiz(quiz);
                              setQuizBuilderOpen(true);
                            }}
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            data-ocid={`teacher.quiz.secondary_button.${i + 1}`}
                            size="sm"
                            variant="outline"
                            className="gap-1.5 flex-1 text-xs h-8"
                            onClick={() => setQuizResultsQuiz(quiz)}
                          >
                            <BarChart2 className="w-3 h-3" />
                            Results
                          </Button>
                          <Button
                            data-ocid={`teacher.quiz.delete_button.${i + 1}`}
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* My Classes — empty state */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            My Classes
          </h2>
          <div
            data-ocid="dashboard.subjects.list"
            className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center"
          >
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">
              No classes added yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your classes will appear here once you are assigned to them.
            </p>
          </div>
        </section>

        {/* Assignments */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Assignments
          </h2>
          {assignments.length === 0 ? (
            <div
              data-ocid="dashboard.assignments.list"
              className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center"
            >
              <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium text-muted-foreground">
                No assignments created yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Use "Create Assignment" above to add your first assignment.
              </p>
            </div>
          ) : (
            <div
              data-ocid="dashboard.assignments.list"
              className="bg-card rounded-xl border border-border/60 shadow-xs divide-y divide-border/60"
            >
              {assignments.map((a, i) => (
                <div
                  key={a.id}
                  data-ocid={`dashboard.assignments.item.${i + 1}`}
                  className="flex items-center justify-between px-4 py-3.5 gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-teacher-light flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-3.5 h-3.5 text-teacher" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {a.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 text-right">
                    <div className="hidden sm:block">
                      <p className="text-xs text-muted-foreground">
                        Due {a.due}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground sm:hidden">
                      <Clock className="w-3 h-3" />
                      {a.due}
                    </div>
                    <Button
                      data-ocid={`dashboard.assignments.delete_button.${i + 1}`}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteAssignment(a.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Incoming Call Bookings */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Student Call Bookings
          </h2>

          {/* Pending */}
          {pendingBookings.length === 0 ? (
            <div
              data-ocid="bookings.pending.empty_state"
              className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center mb-4"
            >
              <Video className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium text-muted-foreground">
                No pending bookings.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                When a student books a call with you, it will appear here.
              </p>
            </div>
          ) : (
            <div
              data-ocid="bookings.pending.list"
              className="bg-card rounded-xl border border-border/60 shadow-xs divide-y divide-border/60 mb-4"
            >
              {pendingBookings.map((b, i) => (
                <div
                  key={b.id}
                  data-ocid={`bookings.pending.item.${i + 1}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3.5 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-student-light flex items-center justify-center flex-shrink-0">
                      {b.callType === "Video" ? (
                        <Video className="w-4 h-4 text-student" />
                      ) : (
                        <Phone className="w-4 h-4 text-student" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {b.studentName} — {b.assignmentTitle}
                      </p>
                      <p className="text-xs text-teacher font-medium mt-0.5">
                        {b.date} at {b.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 pl-11 sm:pl-0">
                    <Badge
                      variant="outline"
                      className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                    >
                      Pending
                    </Badge>
                    <Button
                      data-ocid={`bookings.grade.button.${i + 1}`}
                      size="sm"
                      className="bg-teacher hover:bg-teacher/90 text-white gap-1.5"
                      onClick={() => openGradeDialog(b)}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      Give Grade
                    </Button>
                    <Button
                      data-ocid={`bookings.chat.button.${i + 1}`}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActiveChatBookingId(b.id);
                        markChatRead(b.id, "teacher");
                        setUnreadCounts((prev) => ({ ...prev, [b.id]: 0 }));
                      }}
                      className="gap-1.5 relative"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat
                      {(unreadCounts[b.id] ?? 0) > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 leading-none">
                          {unreadCounts[b.id]}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed */}
          {completedBookings.length > 0 && (
            <div
              data-ocid="bookings.completed.list"
              className="bg-card rounded-xl border border-border/60 shadow-xs divide-y divide-border/60"
            >
              <p className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Completed
              </p>
              {completedBookings.map((b, i) => (
                <div
                  key={b.id}
                  data-ocid={`bookings.completed.item.${i + 1}`}
                  className="flex items-center justify-between px-4 py-3 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {b.studentName} — {b.assignmentTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {b.date} at {b.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-50 text-green-700 border-green-200 flex-shrink-0"
                    >
                      Graded
                    </Badge>
                    <Button
                      data-ocid={`bookings.completed.chat.button.${i + 1}`}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActiveChatBookingId(b.id);
                        markChatRead(b.id, "teacher");
                        setUnreadCounts((prev) => ({ ...prev, [b.id]: 0 }));
                      }}
                      className="gap-1.5 relative"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat
                      {(unreadCounts[b.id] ?? 0) > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 leading-none">
                          {unreadCounts[b.id]}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Create Assignment Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          data-ocid="teacher.assignment.dialog"
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Create Assignment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="a-title">Assignment Title</Label>
              <Input
                id="a-title"
                data-ocid="teacher.assignment.title.input"
                placeholder="e.g. Chapter 5 Review Questions"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-subject">Subject</Label>
              <Input
                id="a-subject"
                data-ocid="teacher.assignment.subject.input"
                placeholder="e.g. Mathematics"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-due">Due Date</Label>
              <Input
                id="a-due"
                data-ocid="teacher.assignment.due.input"
                type="date"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="teacher.assignment.cancel_button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="teacher.assignment.submit_button"
              onClick={handleCreateAssignment}
              className="bg-teacher hover:bg-teacher/90 text-white"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Session Dialog */}
      <Dialog
        open={sessionOpen}
        onOpenChange={(open) => {
          setSessionOpen(open);
          if (!open) clearSessionForm();
        }}
      >
        <DialogContent
          data-ocid="teacher.session.dialog"
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Schedule a Session
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sess-subject">Subject</Label>
              <Input
                id="sess-subject"
                data-ocid="teacher.session.subject.input"
                placeholder="e.g. Mathematics"
                value={sessionSubject}
                onChange={(e) => setSessionSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sess-date">Date</Label>
              <Input
                id="sess-date"
                data-ocid="teacher.session.date.input"
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sess-time">Time</Label>
              <Input
                id="sess-time"
                data-ocid="teacher.session.time.input"
                type="time"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sess-notes">
                Notes{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="sess-notes"
                data-ocid="teacher.session.notes.textarea"
                placeholder="e.g. Bring your textbooks"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="teacher.session.cancel_button"
              variant="outline"
              onClick={() => {
                setSessionOpen(false);
                clearSessionForm();
              }}
            >
              Cancel
            </Button>
            <Button
              data-ocid="teacher.session.submit_button"
              onClick={handleScheduleSession}
              className="bg-teacher hover:bg-teacher/90 text-white"
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={!!gradeBooking} onOpenChange={() => setGradeBooking(null)}>
        <DialogContent data-ocid="teacher.grade.dialog" className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Assign Grade</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Grading:{" "}
            <span className="font-medium text-foreground">
              {gradeBooking?.studentName}
            </span>{" "}
            — {gradeBooking?.assignmentTitle}
          </p>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="grade-val">Grade</Label>
              <Input
                id="grade-val"
                data-ocid="teacher.grade.input"
                placeholder="e.g. A, 85, Pass"
                value={gradeValue}
                onChange={(e) => setGradeValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitGrade()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="grade-feedback">
                Feedback{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="grade-feedback"
                data-ocid="teacher.grade.feedback.textarea"
                placeholder="Comments for the student..."
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="teacher.grade.cancel_button"
              variant="outline"
              onClick={() => setGradeBooking(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="teacher.grade.submit_button"
              onClick={submitGrade}
              className="bg-teacher hover:bg-teacher/90 text-white"
            >
              Save Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {activeChatBookingId &&
        (() => {
          const b = bookings.find((x) => x.id === activeChatBookingId);
          if (!b) return null;
          return (
            <ChatWindow
              bookingId={b.id}
              bookingLabel={`${b.assignmentTitle} — ${b.studentName}`}
              senderRole="teacher"
              senderName={teacherName}
              onClose={() => setActiveChatBookingId(null)}
            />
          );
        })()}

      {/* Quiz Builder Dialog */}
      <QuizBuilder
        open={quizBuilderOpen}
        onClose={() => {
          setQuizBuilderOpen(false);
          setEditingQuiz(null);
        }}
        teacherName={teacherName}
        editingQuiz={editingQuiz}
        onSaved={handleQuizSaved}
      />

      {/* Quiz Results Dialog */}
      {quizResultsQuiz && (
        <QuizResults
          open={!!quizResultsQuiz}
          onClose={() => setQuizResultsQuiz(null)}
          quiz={quizResultsQuiz}
        />
      )}

      <footer className="py-5 text-center text-sm text-muted-foreground border-t border-border/60">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}
          >
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <CardTitle className="text-xs font-medium text-muted-foreground">
            {label}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-4 px-4">
        <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
