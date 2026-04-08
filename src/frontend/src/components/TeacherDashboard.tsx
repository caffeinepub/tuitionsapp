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
  CalendarDays,
  Camera,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Copy,
  Flag,
  GraduationCap,
  Headphones,
  Megaphone,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Radio,
  School,
  Search,
  Send,
  Sparkles,
  Trash2,
  User,
  Users,
  Video,
  X,
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
  type ClassChatMessage,
  getClassChatMessages,
  sendClassChatMessage,
} from "../utils/classChatStorage";
import {
  type ClassAnnouncement,
  type TeacherClass,
  addStudentToClass,
  createClass,
  deleteAnnouncement,
  deleteClass,
  getClassesForTeacher,
  postAnnouncement,
  removeStudentFromClass,
} from "../utils/classStorage";
import { useDashboardColor } from "../utils/dashboardColorStorage";
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
  type RollCall,
  getRollCallsForClass,
  submitRollCall as submitRollCallStorage,
} from "../utils/rollCallStorage";
import { getStudentUsers, isStudentOnline } from "../utils/studentStorage";
import {
  type TpChatMessage,
  getTpMessages,
  getWarningsForTeacher,
  isTeacherBanned,
  sendTpMessage,
} from "../utils/supportStorage";
import {
  type TeacherProfile,
  addTeacherAward,
  getTeacherProfile,
  registerTeacherName,
  removeTeacherAward,
  updateTeacherProfilePicture,
} from "../utils/teacherProfileStorage";
import { ChatWindow } from "./ChatWindow";
import { DashboardColorPicker } from "./DashboardColorPicker";
import { DashboardNav } from "./DashboardNav";
import { FreeTimeRobot } from "./FreeTimeRobot";
import { QuizBuilder } from "./QuizBuilder";
import { QuizResults } from "./QuizResults";
import { ReportUser } from "./ReportUser";
import { StudentReportAI } from "./StudentReportAI";
import { SupportPortal } from "./SupportPortal";
import { TermScheduler } from "./TermScheduler";
import { VoiceLab } from "./VoiceLab";

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

  // My Classes state
  const [classes, setClasses] = useState<TeacherClass[]>(() =>
    getClassesForTeacher(getTeacherName()),
  );
  const [classSectionOpen, setClassSectionOpen] = useState(true);
  const [createClassOpen, setCreateClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassSubject, setNewClassSubject] = useState("");
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [classStudentSearch, setClassStudentSearch] = useState<
    Record<string, string>
  >({});
  const [copiedClassId, setCopiedClassId] = useState<string | null>(null);
  const [announcementText, setAnnouncementText] = useState<
    Record<string, string>
  >({});
  const [announcementFormOpen, setAnnouncementFormOpen] = useState<
    Record<string, boolean>
  >({});
  // Parent Messages (teacher-parent direct chat) state
  const [parentMsgOpen, setParentMsgOpen] = useState(false);
  const [activeTpChannel, setActiveTpChannel] = useState<string | null>(null);
  const [tpMessages, setTpMessages] = useState<TpChatMessage[]>([]);
  const [tpInput, setTpInput] = useState("");
  const [tpPollRef] = useState<{
    interval: ReturnType<typeof setInterval> | null;
  }>({ interval: null });

  // Class chat state
  const [classChatOpen, setClassChatOpen] = useState<Record<string, boolean>>(
    {},
  );
  const [classChatMessages, setClassChatMessages] = useState<
    Record<string, ClassChatMessage[]>
  >({});
  const [classChatInput, setClassChatInput] = useState<Record<string, string>>(
    {},
  );
  // Roll call state
  const [rollCallOpen, setRollCallOpen] = useState<Record<string, boolean>>({});
  const [rollEntries, setRollEntries] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [rollHistoryOpen, setRollHistoryOpen] = useState<
    Record<string, boolean>
  >({});
  const [studentReportOpen, setStudentReportOpen] = useState(false);
  const [termSchedulerOpen, setTermSchedulerOpen] = useState(false);
  const [showVoiceLab, setShowVoiceLab] = useState(false);
  const [deleteClassConfirm, setDeleteClassConfirm] = useState<string | null>(
    null,
  );

  // Support portal & report user state
  const [supportOpen, setSupportOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [teacherGradient, setTeacherGradient] = useDashboardColor("teacher");
  const [reportOpen, setReportOpen] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

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
      setClasses(getClassesForTeacher(name));
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

  // Ban and warning poll
  useEffect(() => {
    function checkBanWarn() {
      const name = getTeacherName();
      if (!name) return;
      if (isTeacherBanned(name)) {
        toast.error("Your account has been banned by the admin.");
        onLogout();
        return;
      }
      const warnings = getWarningsForTeacher(name);
      if (warnings.length > 0) {
        setWarningMsg(warnings[warnings.length - 1].message);
      } else {
        setWarningMsg(null);
      }
    }
    checkBanWarn();
    const id = setInterval(checkBanWarn, 5000);
    return () => clearInterval(id);
  }, [onLogout]);

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

  // TP Chat helpers
  function openTpChat(studentUsername: string) {
    const name = teacherName || getTeacherName();
    const channel = `tp:${name}:${studentUsername}`;
    setActiveTpChannel(channel);
    setTpMessages(getTpMessages(channel));
    // Clear existing poll
    if (tpPollRef.interval) clearInterval(tpPollRef.interval);
    tpPollRef.interval = setInterval(() => {
      setTpMessages(getTpMessages(channel));
    }, 1500);
  }

  function closeTpChat() {
    setActiveTpChannel(null);
    setTpMessages([]);
    setTpInput("");
    if (tpPollRef.interval) {
      clearInterval(tpPollRef.interval);
      tpPollRef.interval = null;
    }
  }

  function sendTpMsg() {
    if (!activeTpChannel || !tpInput.trim()) return;
    const name = teacherName || getTeacherName();
    sendTpMessage(activeTpChannel, "teacher", name, tpInput.trim());
    setTpInput("");
    setTpMessages(getTpMessages(activeTpChannel));
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

  // --- Class handlers ---
  function handleCreateClass() {
    if (!newClassName.trim() || !newClassSubject.trim()) return;
    const name = teacherName || getTeacherName();
    const newCls = createClass(newClassName, newClassSubject, name);
    setClasses((prev) => [...prev, newCls]);
    setNewClassName("");
    setNewClassSubject("");
    setCreateClassOpen(false);
    toast.success(`Class "${newCls.name}" created! Code: ${newCls.classCode}`);
  }

  function handleDeleteClass(id: string) {
    deleteClass(id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setDeleteClassConfirm(null);
    toast.success("Class deleted.");
  }

  function handleAddStudentToClass(classId: string, username: string) {
    const result = addStudentToClass(classId, username);
    if (result.success) {
      setClasses(getClassesForTeacher(teacherName || getTeacherName()));
      setClassStudentSearch((prev) => ({ ...prev, [classId]: "" }));
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }

  function handleRemoveStudentFromClass(classId: string, username: string) {
    removeStudentFromClass(classId, username);
    setClasses(getClassesForTeacher(teacherName || getTeacherName()));
    toast.success(`${username} removed from class.`);
  }

  function handleCopyClassCode(cls: TeacherClass) {
    navigator.clipboard.writeText(cls.classCode).then(() => {
      setCopiedClassId(cls.id);
      toast.success(`Class code ${cls.classCode} copied!`);
      setTimeout(() => setCopiedClassId(null), 2000);
    });
  }

  function handlePostAnnouncement(classId: string) {
    const text = announcementText[classId]?.trim();
    if (!text) return;
    postAnnouncement(classId, text);
    setClasses(getClassesForTeacher(getTeacherName()));
    setAnnouncementText((prev) => ({ ...prev, [classId]: "" }));
    setAnnouncementFormOpen((prev) => ({ ...prev, [classId]: false }));
    toast.success("Announcement posted!");
  }

  function handleDeleteAnnouncement(classId: string, announcementId: string) {
    deleteAnnouncement(classId, announcementId);
    setClasses(getClassesForTeacher(getTeacherName()));
  }

  // Class chat helpers
  function openClassChat(classId: string) {
    setClassChatOpen((prev) => ({ ...prev, [classId]: true }));
    setClassChatMessages((prev) => ({
      ...prev,
      [classId]: getClassChatMessages(classId),
    }));
    // Poll
    const interval = setInterval(() => {
      setClassChatMessages((prev) => ({
        ...prev,
        [classId]: getClassChatMessages(classId),
      }));
    }, 2000);
    (window as any)[`_classChatPoll_${classId}`] = interval;
  }

  function closeClassChat(classId: string) {
    setClassChatOpen((prev) => ({ ...prev, [classId]: false }));
    if ((window as any)[`_classChatPoll_${classId}`]) {
      clearInterval((window as any)[`_classChatPoll_${classId}`]);
    }
  }

  function sendClassChat(classId: string) {
    const text = (classChatInput[classId] ?? "").trim();
    if (!text) return;
    const tName = teacherName || getTeacherName();
    sendClassChatMessage(classId, tName, "teacher", text);
    setClassChatInput((prev) => ({ ...prev, [classId]: "" }));
    setClassChatMessages((prev) => ({
      ...prev,
      [classId]: getClassChatMessages(classId),
    }));
  }

  // Roll call helpers
  function openRollCall(classId: string, studentUsernames: string[]) {
    const entries: Record<string, boolean> = {};
    for (const u of studentUsernames) entries[u] = isStudentOnline(u);
    setRollEntries((prev) => ({ ...prev, [classId]: entries }));
    setRollCallOpen((prev) => ({ ...prev, [classId]: true }));
  }

  function toggleRollEntry(classId: string, username: string) {
    setRollEntries((prev) => ({
      ...prev,
      [classId]: {
        ...(prev[classId] ?? {}),
        [username]: !(prev[classId]?.[username] ?? true),
      },
    }));
  }

  function submitRoll(cls: {
    id: string;
    name: string;
    studentUsernames: string[];
  }) {
    const entries = rollEntries[cls.id] ?? {};
    const rollData = cls.studentUsernames.map((u) => ({
      username: u,
      present: entries[u] ?? true,
    }));
    const tName = teacherName || getTeacherName();
    submitRollCallStorage(cls.id, cls.name, tName, rollData);
    setRollCallOpen((prev) => ({ ...prev, [cls.id]: false }));
    setRollHistoryOpen((prev) => ({ ...prev, [cls.id]: true }));
    toast.success("Roll call submitted!");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Support Portal */}
      {supportOpen && (
        <SupportPortal
          senderRole="teacher"
          senderName={teacherName}
          senderPrincipal={
            localStorage.getItem("tuitions_teacher_principal") ?? teacherName
          }
          onClose={() => setSupportOpen(false)}
        />
      )}

      {/* Report User */}
      {reportOpen && (
        <ReportUser
          reporterRole="teacher"
          reporterName={teacherName}
          onClose={() => setReportOpen(false)}
        />
      )}

      {/* Student Reports AI */}
      {studentReportOpen && (
        <StudentReportAI
          teacherName={teacherName || getTeacherName()}
          onClose={() => setStudentReportOpen(false)}
        />
      )}

      {/* Term Scheduler */}
      {termSchedulerOpen && (
        <TermScheduler
          teacherName={teacherName || getTeacherName()}
          onClose={() => setTermSchedulerOpen(false)}
        />
      )}

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

      <DashboardColorPicker
        dashboardRole="teacher"
        current={teacherGradient}
        onApply={(g) => {
          setTeacherGradient(g);
          setColorPickerOpen(false);
        }}
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
      />
      <DashboardNav
        userRole="Teacher"
        onLogout={onLogout}
        headerClass="dashboard-header-teacher"
        headerStyle={
          teacherGradient ? { background: teacherGradient } : undefined
        }
        onCustomizeColor={() => setColorPickerOpen(true)}
      />

      {/* Warning banner */}
      {warningMsg && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 flex items-center gap-2">
          <span className="text-amber-800 text-sm font-medium">
            ⚠️ Admin Warning: {warningMsg}
          </span>
        </div>
      )}

      {/* Support & Report action row */}
      <div
        className="dashboard-header-teacher px-4 sm:px-6 pt-2 pb-0"
        style={teacherGradient ? { background: teacherGradient } : undefined}
      >
        <div className="max-w-6xl mx-auto flex justify-end gap-2">
          <button
            type="button"
            data-ocid="teacher.support.button"
            onClick={() => setSupportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors"
          >
            <Headphones className="w-3.5 h-3.5" />
            Support
          </button>
          <button
            type="button"
            data-ocid="teacher.report.open_modal_button"
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            Report User
          </button>
        </div>
      </div>

      {/* Welcome banner */}
      <div
        className="dashboard-header-teacher px-4 sm:px-6 pb-8"
        style={teacherGradient ? { background: teacherGradient } : undefined}
      >
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
          <Button
            data-ocid="teacher.student.reports.button"
            onClick={() => setStudentReportOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Student Reports AI
          </Button>
          <Button
            data-ocid="teacher.term.schedule.button"
            variant="outline"
            onClick={() => setTermSchedulerOpen(true)}
            className="font-semibold gap-2 border-amber-400/50 text-amber-600 hover:bg-amber-50"
          >
            <CalendarDays className="w-4 h-4" />
            Term Schedule
          </Button>
          <Button
            data-ocid="teacher.voicelab.button"
            variant="outline"
            onClick={() => setShowVoiceLab((v) => !v)}
            className={`font-semibold gap-2 ${showVoiceLab ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700" : "border-emerald-400/50 text-emerald-700 hover:bg-emerald-50"}`}
          >
            <Radio className="w-4 h-4" />
            {showVoiceLab ? "← Dashboard" : "Voice Lab"}
          </Button>
        </div>

        {/* Voice Lab */}
        {showVoiceLab && (
          <div className="mb-8">
            <VoiceLab
              currentUsername={teacherName || getTeacherName()}
              currentDisplayName={teacherName || getTeacherName()}
              currentRole="teacher"
              classes={classes}
            />
          </div>
        )}

        {!showVoiceLab && (
          <>
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

            {/* My Classes */}
            <section className="mb-8">
              <button
                type="button"
                data-ocid="teacher.classes.section.toggle"
                onClick={() => setClassSectionOpen((o) => !o)}
                className="flex items-center gap-2 w-full mb-4 group"
              >
                <School className="w-5 h-5 text-teacher" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  My Classes
                </h2>
                {classSectionOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground transition-colors" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground transition-colors" />
                )}
              </button>

              {classSectionOpen && (
                <div className="space-y-3">
                  <Button
                    data-ocid="teacher.classes.create.button"
                    onClick={() => setCreateClassOpen(true)}
                    className="bg-teacher hover:bg-teacher/90 text-white gap-2"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create Class
                  </Button>

                  {classes.length === 0 ? (
                    <div
                      data-ocid="teacher.classes.empty_state"
                      className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center"
                    >
                      <School className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium text-muted-foreground">
                        No classes yet.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Create a class and add students to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {classes.map((cls, i) => {
                        const isExpanded = expandedClassId === cls.id;
                        const searchVal = classStudentSearch[cls.id] ?? "";
                        const allStudents = getStudentUsers();
                        const matchingStudents =
                          searchVal.trim().length > 0
                            ? allStudents.filter(
                                (s) =>
                                  !cls.studentUsernames.includes(
                                    s.username.toLowerCase(),
                                  ) &&
                                  (s.username
                                    .toLowerCase()
                                    .includes(searchVal.toLowerCase()) ||
                                    s.name
                                      .toLowerCase()
                                      .includes(searchVal.toLowerCase())),
                              )
                            : [];
                        const isCopied = copiedClassId === cls.id;
                        return (
                          <Card
                            key={cls.id}
                            data-ocid={`teacher.classes.item.${i + 1}`}
                            className="border border-border/60 shadow-xs"
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base font-bold truncate">
                                    {cls.name}
                                  </CardTitle>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {cls.subject}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {cls.studentUsernames.length} student
                                    {cls.studentUsernames.length !== 1
                                      ? "s"
                                      : ""}
                                  </Badge>
                                  <Button
                                    data-ocid={`teacher.classes.delete_button.${i + 1}`}
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() =>
                                      setDeleteClassConfirm(cls.id)
                                    }
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>

                              {/* Class Code */}
                              <div className="flex items-center gap-2 mt-3 bg-muted/50 rounded-lg px-3 py-2">
                                <span className="text-xs text-muted-foreground font-medium mr-1">
                                  Class Code:
                                </span>
                                <span className="font-mono text-lg font-bold text-teacher tracking-widest flex-1">
                                  {cls.classCode}
                                </span>
                                <Button
                                  data-ocid={`teacher.classes.copy_code.${i + 1}`}
                                  size="sm"
                                  variant="outline"
                                  className="h-7 gap-1 text-xs"
                                  onClick={() => handleCopyClassCode(cls)}
                                >
                                  <Copy className="w-3 h-3" />
                                  {isCopied ? "Copied!" : "Copy"}
                                </Button>
                              </div>

                              <button
                                type="button"
                                className="flex items-center gap-1 mt-2 text-xs text-teacher hover:text-teacher/80 font-medium transition-colors"
                                onClick={() =>
                                  setExpandedClassId(isExpanded ? null : cls.id)
                                }
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-3.5 h-3.5" /> Hide
                                    students
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3.5 h-3.5" />{" "}
                                    Manage students
                                  </>
                                )}
                              </button>
                            </CardHeader>

                            {isExpanded && (
                              <CardContent className="pt-0 pb-4">
                                {/* Enrolled students */}
                                {cls.studentUsernames.length > 0 ? (
                                  <div className="mb-3 space-y-1">
                                    {cls.studentUsernames.map((uname, si) => {
                                      const stu = allStudents.find(
                                        (s) =>
                                          s.username.toLowerCase() ===
                                          uname.toLowerCase(),
                                      );
                                      return (
                                        <div
                                          key={uname}
                                          data-ocid={`teacher.classes.student.item.${si + 1}`}
                                          className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-1.5"
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-teacher-light flex items-center justify-center">
                                              <User className="w-3 h-3 text-teacher" />
                                            </div>
                                            <span className="text-sm font-medium">
                                              {stu ? stu.name : uname}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              @{uname}
                                            </span>
                                          </div>
                                          <Button
                                            data-ocid={`teacher.classes.remove_student.${si + 1}`}
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                            onClick={() =>
                                              handleRemoveStudentFromClass(
                                                cls.id,
                                                uname,
                                              )
                                            }
                                          >
                                            <X className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground mb-3">
                                    No students yet. Search below or share the
                                    class code.
                                  </p>
                                )}

                                {/* Add student search */}
                                <div className="relative">
                                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                  <input
                                    data-ocid={`teacher.classes.search_input.${i + 1}`}
                                    type="text"
                                    placeholder="Search students by name or username..."
                                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-teacher/50"
                                    value={searchVal}
                                    onChange={(e) =>
                                      setClassStudentSearch((prev) => ({
                                        ...prev,
                                        [cls.id]: e.target.value,
                                      }))
                                    }
                                  />
                                </div>

                                {matchingStudents.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {matchingStudents.slice(0, 8).map((s) => (
                                      <button
                                        key={s.username}
                                        type="button"
                                        onClick={() =>
                                          handleAddStudentToClass(
                                            cls.id,
                                            s.username,
                                          )
                                        }
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teacher-light text-teacher text-xs font-medium hover:bg-teacher hover:text-white transition-colors"
                                      >
                                        <Plus className="w-3 h-3" />
                                        {s.name}{" "}
                                        <span className="opacity-70">
                                          @{s.username}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {searchVal.trim().length > 0 &&
                                  matchingStudents.length === 0 && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      No matching students found.
                                    </p>
                                  )}

                                {/* Announcements */}
                                <div className="mt-4 border-t border-border/40 pt-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                                      <Megaphone className="w-3.5 h-3.5 text-teacher" />
                                      Announcements
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-xs gap-1"
                                      onClick={() =>
                                        setAnnouncementFormOpen((prev) => ({
                                          ...prev,
                                          [cls.id]: !prev[cls.id],
                                        }))
                                      }
                                    >
                                      <Plus className="w-3 h-3" />
                                      Post
                                    </Button>
                                  </div>

                                  {announcementFormOpen[cls.id] && (
                                    <div className="mb-3 space-y-2">
                                      <textarea
                                        className="w-full text-sm border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-teacher/50 bg-background"
                                        rows={2}
                                        placeholder="Write an announcement for this class..."
                                        value={announcementText[cls.id] ?? ""}
                                        onChange={(e) =>
                                          setAnnouncementText((prev) => ({
                                            ...prev,
                                            [cls.id]: e.target.value,
                                          }))
                                        }
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          className="bg-teacher hover:bg-teacher/90 text-white h-7 text-xs"
                                          onClick={() =>
                                            handlePostAnnouncement(cls.id)
                                          }
                                          disabled={
                                            !announcementText[cls.id]?.trim()
                                          }
                                        >
                                          Post
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 text-xs"
                                          onClick={() =>
                                            setAnnouncementFormOpen((prev) => ({
                                              ...prev,
                                              [cls.id]: false,
                                            }))
                                          }
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  {cls.announcements.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                      No announcements yet.
                                    </p>
                                  ) : (
                                    <div className="space-y-2">
                                      {cls.announcements.map(
                                        (ann: ClassAnnouncement) => (
                                          <div
                                            key={ann.id}
                                            className="flex items-start justify-between gap-2 bg-muted/40 rounded-lg px-3 py-2"
                                          >
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm text-foreground">
                                                {ann.text}
                                              </p>
                                              <p className="text-xs text-muted-foreground mt-0.5">
                                                {new Date(
                                                  ann.createdAt,
                                                ).toLocaleString()}
                                              </p>
                                            </div>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                                              onClick={() =>
                                                handleDeleteAnnouncement(
                                                  cls.id,
                                                  ann.id,
                                                )
                                              }
                                            >
                                              <X className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  )}
                                </div>
                                {/* Class Chat */}
                                <div className="mt-4 border-t border-border/40 pt-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                                      <MessageSquare className="w-3.5 h-3.5 text-teacher" />
                                      Class Chat
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-xs gap-1"
                                      onClick={() =>
                                        classChatOpen[cls.id]
                                          ? closeClassChat(cls.id)
                                          : openClassChat(cls.id)
                                      }
                                    >
                                      {classChatOpen[cls.id]
                                        ? "Close"
                                        : "Open Chat"}
                                    </Button>
                                  </div>
                                  {classChatOpen[cls.id] && (
                                    <div className="flex flex-col gap-2">
                                      <div
                                        className="bg-muted/30 rounded-lg p-2 h-40 overflow-y-auto flex flex-col gap-1 text-xs"
                                        style={{ scrollbarWidth: "thin" }}
                                      >
                                        {(classChatMessages[cls.id] ?? [])
                                          .length === 0 ? (
                                          <p className="text-muted-foreground text-center mt-4">
                                            No messages yet. Start the
                                            conversation!
                                          </p>
                                        ) : (
                                          (classChatMessages[cls.id] ?? []).map(
                                            (msg) => (
                                              <div
                                                key={msg.id}
                                                className={`flex gap-1.5 ${msg.senderRole === "teacher" ? "flex-row-reverse" : ""}`}
                                              >
                                                <div
                                                  className={`max-w-[75%] px-2 py-1 rounded-lg ${msg.senderRole === "teacher" ? "bg-teacher text-white" : "bg-white border border-border"}`}
                                                >
                                                  <p
                                                    className={`text-[10px] font-semibold mb-0.5 ${msg.senderRole === "teacher" ? "text-white/80" : "text-teacher"}`}
                                                  >
                                                    {msg.senderRole ===
                                                    "teacher"
                                                      ? "You (Teacher)"
                                                      : msg.senderUsername}
                                                  </p>
                                                  <p>{msg.text}</p>
                                                </div>
                                              </div>
                                            ),
                                          )
                                        )}
                                      </div>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          className="flex-1 text-xs border border-border rounded-lg px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-teacher/50"
                                          placeholder="Type a message..."
                                          value={classChatInput[cls.id] ?? ""}
                                          onChange={(e) =>
                                            setClassChatInput((prev) => ({
                                              ...prev,
                                              [cls.id]: e.target.value,
                                            }))
                                          }
                                          onKeyDown={(e) =>
                                            e.key === "Enter" &&
                                            sendClassChat(cls.id)
                                          }
                                        />
                                        <Button
                                          size="sm"
                                          className="bg-teacher hover:bg-teacher/90 text-white h-7 text-xs px-2"
                                          onClick={() => sendClassChat(cls.id)}
                                        >
                                          Send
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Roll Call */}
                                {cls.studentUsernames.length > 0 && (
                                  <div className="mt-4 border-t border-border/40 pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                                        <ClipboardList className="w-3.5 h-3.5 text-teacher" />
                                        Roll Call
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-xs gap-1"
                                        onClick={() =>
                                          rollCallOpen[cls.id]
                                            ? setRollCallOpen((prev) => ({
                                                ...prev,
                                                [cls.id]: false,
                                              }))
                                            : openRollCall(
                                                cls.id,
                                                cls.studentUsernames,
                                              )
                                        }
                                      >
                                        {rollCallOpen[cls.id]
                                          ? "Close"
                                          : "Take Roll"}
                                      </Button>
                                    </div>
                                    {rollCallOpen[cls.id] && (
                                      <div className="space-y-2">
                                        {cls.studentUsernames.map((uname) => {
                                          const isPresent =
                                            rollEntries[cls.id]?.[uname] ??
                                            true;
                                          const stu = allStudents.find(
                                            (s) =>
                                              s.username.toLowerCase() ===
                                              uname.toLowerCase(),
                                          );
                                          return (
                                            <div
                                              key={uname}
                                              className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-1.5"
                                            >
                                              <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-teacher-light flex items-center justify-center">
                                                  <User className="w-3 h-3 text-teacher" />
                                                </div>
                                                <span
                                                  className={`w-2 h-2 rounded-full ${
                                                    isStudentOnline(uname)
                                                      ? "bg-green-500"
                                                      : "bg-gray-400"
                                                  }`}
                                                />
                                                <span className="text-sm font-medium">
                                                  {stu ? stu.name : uname}
                                                </span>
                                                <span
                                                  className={`text-xs ${
                                                    isStudentOnline(uname)
                                                      ? "text-green-600"
                                                      : "text-gray-400"
                                                  }`}
                                                >
                                                  {isStudentOnline(uname)
                                                    ? "Online"
                                                    : "Offline"}
                                                </span>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  toggleRollEntry(cls.id, uname)
                                                }
                                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                                  isPresent
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                                }`}
                                              >
                                                {isPresent
                                                  ? "✓ Present"
                                                  : "✗ Absent"}
                                              </button>
                                            </div>
                                          );
                                        })}
                                        <Button
                                          size="sm"
                                          className="w-full bg-teacher hover:bg-teacher/90 text-white text-xs mt-2"
                                          onClick={() => submitRoll(cls)}
                                        >
                                          Submit Roll Call
                                        </Button>
                                      </div>
                                    )}

                                    {/* Past Roll Calls */}
                                    {rollHistoryOpen[cls.id] &&
                                      (() => {
                                        const rolls = getRollCallsForClass(
                                          cls.id,
                                        );
                                        return (
                                          <div className="mt-3 border-t border-border/40 pt-3 space-y-2">
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                                                <ClipboardCheck className="w-3.5 h-3.5 text-teacher" />
                                                Roll History
                                              </span>
                                              <button
                                                type="button"
                                                className="text-xs text-muted-foreground hover:text-foreground underline"
                                                onClick={() =>
                                                  setRollHistoryOpen(
                                                    (prev) => ({
                                                      ...prev,
                                                      [cls.id]: false,
                                                    }),
                                                  )
                                                }
                                              >
                                                Hide
                                              </button>
                                            </div>
                                            {rolls.length === 0 ? (
                                              <p className="text-xs text-muted-foreground italic">
                                                No rolls submitted yet.
                                              </p>
                                            ) : (
                                              rolls.map((roll) => {
                                                const presentCount =
                                                  roll.entries.filter(
                                                    (e) => e.present,
                                                  ).length;
                                                const studentMap =
                                                  getStudentUsers().reduce<
                                                    Record<string, string>
                                                  >((acc, s) => {
                                                    acc[
                                                      s.username.toLowerCase()
                                                    ] = s.name;
                                                    return acc;
                                                  }, {});
                                                return (
                                                  <RollHistoryItem
                                                    key={roll.id}
                                                    roll={roll}
                                                    presentCount={presentCount}
                                                    studentMap={studentMap}
                                                  />
                                                );
                                              })
                                            )}
                                          </div>
                                        );
                                      })()}
                                  </div>
                                )}
                              </CardContent>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Delete Class Confirmation Dialog */}
              <Dialog
                open={deleteClassConfirm !== null}
                onOpenChange={(o) => !o && setDeleteClassConfirm(null)}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Class</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete this class? All enrolled
                    students will be removed.
                  </p>
                  <DialogFooter>
                    <Button
                      data-ocid="teacher.classes.delete.cancel_button"
                      variant="outline"
                      onClick={() => setDeleteClassConfirm(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      data-ocid="teacher.classes.delete.confirm_button"
                      variant="destructive"
                      onClick={() =>
                        deleteClassConfirm &&
                        handleDeleteClass(deleteClassConfirm)
                      }
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Create Class Dialog */}
              <Dialog open={createClassOpen} onOpenChange={setCreateClassOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a New Class</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div>
                      <Label
                        htmlFor="new-class-name"
                        className="text-sm font-medium"
                      >
                        Class Name
                      </Label>
                      <Input
                        data-ocid="teacher.classes.name.input"
                        id="new-class-name"
                        placeholder="e.g. Year 8 Maths Group A"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="new-class-subject"
                        className="text-sm font-medium"
                      >
                        Subject
                      </Label>
                      <Input
                        data-ocid="teacher.classes.subject.input"
                        id="new-class-subject"
                        placeholder="e.g. Mathematics"
                        value={newClassSubject}
                        onChange={(e) => setNewClassSubject(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      data-ocid="teacher.classes.create.cancel_button"
                      variant="outline"
                      onClick={() => {
                        setCreateClassOpen(false);
                        setNewClassName("");
                        setNewClassSubject("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      data-ocid="teacher.classes.create.submit_button"
                      className="bg-teacher hover:bg-teacher/90 text-white"
                      onClick={handleCreateClass}
                      disabled={!newClassName.trim() || !newClassSubject.trim()}
                    >
                      Create Class
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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

            {/* Parent Messages (direct teacher-parent chat) */}
            <section className="mb-8">
              <button
                type="button"
                data-ocid="teacher.parent_messages.toggle"
                onClick={() => {
                  setParentMsgOpen((o) => !o);
                  closeTpChat();
                }}
                className="flex items-center gap-2 w-full mb-4 group"
              >
                <MessageSquare className="w-5 h-5 text-teacher" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Parent Messages
                </h2>
                {parentMsgOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground transition-colors" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground transition-colors" />
                )}
              </button>

              {parentMsgOpen &&
                (() => {
                  // Get unique students from bookings
                  const studentMap = new Map<string, string>();
                  for (const b of bookings) {
                    if (!studentMap.has(b.studentUsername)) {
                      studentMap.set(b.studentUsername, b.studentName);
                    }
                  }
                  const students = Array.from(studentMap.entries());

                  return students.length === 0 ? (
                    <div
                      data-ocid="teacher.parent_messages.empty_state"
                      className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center"
                    >
                      <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium text-muted-foreground">
                        No parent chats yet.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Chats appear once students have booked sessions and
                        parents are linked.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {students.map(([studentUsername, studentName], i) => {
                        const name = teacherName || getTeacherName();
                        const channel = `tp:${name}:${studentUsername}`;
                        const isActive = activeTpChannel === channel;
                        return (
                          <div
                            key={studentUsername}
                            data-ocid={`teacher.parent_messages.item.${i + 1}`}
                            className="bg-card rounded-xl border border-border/60 shadow-xs overflow-hidden"
                          >
                            <div className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-parent-light flex items-center justify-center">
                                  <Users className="w-4 h-4 text-parent" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    Parent of {studentName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {studentUsername}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant={isActive ? "default" : "outline"}
                                className={
                                  isActive
                                    ? "bg-teacher hover:bg-teacher/90 text-white gap-1.5"
                                    : "gap-1.5 text-xs border-teacher/30 text-teacher hover:bg-teacher-light"
                                }
                                onClick={() => {
                                  if (isActive) {
                                    closeTpChat();
                                  } else {
                                    openTpChat(studentUsername);
                                  }
                                }}
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                {isActive ? "Close Chat" : "Chat"}
                              </Button>
                            </div>

                            {isActive && (
                              <div className="border-t border-border/40 p-4">
                                <div
                                  className="h-48 overflow-y-auto mb-3 space-y-2 bg-background rounded-lg p-3 border border-border/40"
                                  style={{ scrollbarWidth: "thin" }}
                                >
                                  {tpMessages.length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-6">
                                      No messages yet. Start the conversation!
                                    </p>
                                  ) : (
                                    tpMessages.map((msg) => (
                                      <div
                                        key={msg.id}
                                        className={`flex ${msg.senderRole === "teacher" ? "justify-end" : "justify-start"}`}
                                      >
                                        <div
                                          className={`max-w-[75%] px-3 py-1.5 rounded-xl text-xs ${msg.senderRole === "teacher" ? "bg-teacher text-white rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}
                                        >
                                          <p className="font-semibold mb-0.5 opacity-75">
                                            {msg.senderName}
                                          </p>
                                          <p>{msg.text}</p>
                                          <p className="text-[10px] mt-0.5 opacity-60">
                                            {new Date(
                                              msg.sentAt,
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </p>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    data-ocid="teacher.parent_messages.input"
                                    type="text"
                                    value={tpInput}
                                    onChange={(e) => setTpInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendTpMsg();
                                      }
                                    }}
                                    placeholder="Type a message..."
                                    className="flex-1 h-8 text-xs px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-teacher/50"
                                  />
                                  <Button
                                    data-ocid="teacher.parent_messages.button"
                                    size="sm"
                                    className="h-8 bg-teacher hover:bg-teacher/90 text-white gap-1"
                                    onClick={sendTpMsg}
                                  >
                                    <Send className="w-3 h-3" />
                                    Send
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
            </section>
          </>
        )}
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
      <FreeTimeRobot mode="teacher" />
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

function RollHistoryItem({
  roll,
  presentCount,
  studentMap,
}: {
  roll: RollCall;
  presentCount: number;
  studentMap: Record<string, string>;
}) {
  const [expanded, setExpanded] = useState(false);
  const formattedDate = new Date(roll.submittedAt).toLocaleDateString(
    undefined,
    { weekday: "short", year: "numeric", month: "short", day: "numeric" },
  );
  return (
    <div className="bg-muted/30 rounded-lg border border-border/40 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="text-xs font-medium text-foreground">
          {formattedDate}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {presentCount}/{roll.entries.length} present
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
            {Math.round(
              (presentCount / Math.max(roll.entries.length, 1)) * 100,
            )}
            %
          </span>
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-2 pt-1 space-y-1 border-t border-border/30">
          {roll.entries.map((entry) => (
            <div
              key={entry.username}
              className="flex items-center justify-between py-0.5"
            >
              <span className="text-xs text-muted-foreground">
                {studentMap[entry.username.toLowerCase()] ?? entry.username}
              </span>
              <span
                className={`text-xs font-semibold ${
                  entry.present ? "text-green-600" : "text-red-500"
                }`}
              >
                {entry.present ? "✓ Present" : "✗ Absent"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
