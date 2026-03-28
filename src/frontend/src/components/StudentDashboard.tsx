import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ClipboardList,
  Flag,
  GraduationCap,
  KeyRound,
  Megaphone,
  MessageSquare,
  School,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { StudentUser } from "../App";
import { createActorWithConfig } from "../config";
import {
  type Assignment,
  type CallBooking,
  getAssignments,
  getBookingsForStudent,
  getGradesForStudent,
  getUnreadCount,
  markChatRead,
  saveCallBooking,
} from "../utils/assignmentStorage";
import {
  type ClassAnnouncement,
  type TeacherClass,
  getClassesForStudent,
  joinClassByCode,
} from "../utils/classStorage";
import {
  type Quiz,
  type QuizAssignment,
  getAssignedQuizzesForStudent,
  getAttemptsUsed,
} from "../utils/quizStorage";
import { getOrCreateVerificationCode } from "../utils/studentStorage";
import { getWarningsForStudent } from "../utils/supportStorage";
import { AiDoubtBot } from "./AiDoubtBot";
import { ChatWindow } from "./ChatWindow";
import { DashboardNav } from "./DashboardNav";
import { LearningGames } from "./LearningGames";
import { QuizTaker } from "./QuizTaker";
import { ReportUser } from "./ReportUser";

type Props = {
  student: StudentUser;
  onLogout: () => void;
};

export function StudentDashboard({ student, onLogout }: Props) {
  const verificationCode = useMemo(
    () => getOrCreateVerificationCode(student.username),
    [student.username],
  );

  // Sync student profile and verification code to backend on mount.
  // This enables cross-device parent-student linking.
  useEffect(() => {
    const username = student.username.toLowerCase();
    const name = student.name;

    createActorWithConfig()
      .then((actor: any) => {
        // Single upsert call: syncs student name + verification code to backend.
        // Works cross-device so parents can always find the student by username.
        actor
          .syncStudentForParentLink(username, name, verificationCode)
          .catch(() => {
            /* ignore network errors */
          });
      })
      .catch(() => {
        /* ignore network errors */
      });
  }, [student.username, student.name, verificationCode]);

  const [reportOpen, setReportOpen] = useState(false);
  const [studentWarning, setStudentWarning] = useState<string | null>(null);

  // All teacher-created assignments
  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    getAssignments(),
  );

  // Student's bookings
  const [myBookings, setMyBookings] = useState<CallBooking[]>(() =>
    getBookingsForStudent(student.username),
  );

  // Student's grades
  const [myGrades, setMyGrades] = useState(() =>
    getGradesForStudent(student.username),
  );

  const [activeChatBookingId, setActiveChatBookingId] = useState<string | null>(
    null,
  );

  // Unread counts per booking (messages from teacher)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Quizzes assigned to this student
  const [myQuizzes, setMyQuizzes] = useState<
    Array<{ quiz: Quiz; assignment: QuizAssignment }>
  >(() => getAssignedQuizzesForStudent(student.username));
  const [takingQuiz, setTakingQuiz] = useState<{
    quiz: Quiz;
    assignment: QuizAssignment;
  } | null>(null);

  // Refresh on focus (teacher may have added assignments or grades)
  useEffect(() => {
    function refresh() {
      setAssignments(getAssignments());
      setMyBookings(getBookingsForStudent(student.username));
      setMyGrades(getGradesForStudent(student.username));
      setMyQuizzes(getAssignedQuizzesForStudent(student.username));
    }
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [student.username]);

  // Poll unread message counts every 1.5s so student sees badge when teacher replies
  useEffect(() => {
    function refreshUnread() {
      const bookings = getBookingsForStudent(student.username);
      const counts: Record<string, number> = {};
      for (const b of bookings) {
        counts[b.id] = getUnreadCount(b.id, "student");
      }
      setUnreadCounts(counts);
    }
    refreshUnread();
    const timer = setInterval(refreshUnread, 1500);
    return () => clearInterval(timer);
  }, [student.username]);

  // My Classes state
  const [myClasses, setMyClasses] = useState<TeacherClass[]>(() =>
    getClassesForStudent(student.username),
  );
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [classSectionOpen, setClassSectionOpen] = useState(true);

  // Auto-refresh classes every 5 seconds
  useEffect(() => {
    function refreshClasses() {
      setMyClasses(getClassesForStudent(student.username));
    }
    refreshClasses();
    const timer = setInterval(refreshClasses, 5000);
    return () => clearInterval(timer);
  }, [student.username]);

  function handleJoinClass() {
    if (!joinCodeInput.trim()) return;
    const result = joinClassByCode(joinCodeInput.trim(), student.username);
    if (result.success) {
      setMyClasses(getClassesForStudent(student.username));
      setJoinCodeInput("");
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }

  // Assignment search
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const filteredAssignments = useMemo(() => {
    const q = assignmentSearch.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q) ||
        a.teacherName.toLowerCase().includes(q),
    );
  }, [assignments, assignmentSearch]);

  // Booking dialog
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  function openBooking(a: Assignment) {
    setSelectedAssignment(a);
    setBookingDate("");
    setBookingTime("");
    setBookingDialogOpen(true);
  }

  function confirmBooking() {
    if (!selectedAssignment || !bookingDate || !bookingTime) return;
    const booking: CallBooking = {
      id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      assignmentId: selectedAssignment.id,
      assignmentTitle: selectedAssignment.title,
      subject: selectedAssignment.subject,
      teacherName: selectedAssignment.teacherName,
      studentUsername: student.username,
      studentName: student.name,
      callType: "Video",
      date: bookingDate,
      time: bookingTime,
      status: "pending",
      createdAt: Date.now(),
    };
    saveCallBooking(booking);
    setMyBookings((prev) => [booking, ...prev]);
    setBookingDialogOpen(false);
    setSelectedAssignment(null);
    toast.success(
      `Video call booked with ${selectedAssignment.teacherName} for ${bookingDate} at ${bookingTime}!`,
    );
  }

  function cancelBooking() {
    setBookingDialogOpen(false);
    setSelectedAssignment(null);
  }

  // Student warning poll
  useEffect(() => {
    function checkWarn() {
      const warnings = getWarningsForStudent(student.username);
      if (warnings.length > 0) {
        setStudentWarning(warnings[warnings.length - 1].message);
      } else {
        setStudentWarning(null);
      }
    }
    checkWarn();
    const id = setInterval(checkWarn, 5000);
    return () => clearInterval(id);
  }, [student.username]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNav
        userRole="Student"
        userName={student.name}
        onLogout={onLogout}
        headerClass="dashboard-header-student"
      />

      {/* Student warning banner */}
      {studentWarning && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 flex items-center gap-2">
          <span className="text-amber-800 text-sm font-medium">
            ⚠️ Admin Warning: {studentWarning}
          </span>
        </div>
      )}

      {/* Report action */}
      <div className="dashboard-header-student px-4 sm:px-6 pt-2 pb-0">
        <div className="max-w-6xl mx-auto flex justify-end">
          <button
            type="button"
            data-ocid="student.report.open_modal_button"
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            Report User
          </button>
        </div>
      </div>

      {/* Welcome banner */}
      <div className="dashboard-header-student px-4 sm:px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Welcome back, {student.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-white/70 text-sm">
            Here's your learning overview.
          </p>
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full -mt-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={BookOpen}
            label="Subjects Enrolled"
            value="—"
            color="text-student"
            bg="bg-student-light"
          />
          <StatCard
            icon={ClipboardList}
            label="Assignments Available"
            value={String(assignments.length)}
            color="text-parent"
            bg="bg-parent-light"
          />
          <StatCard
            icon={BarChart3}
            label="Grades Received"
            value={String(myGrades.length)}
            color="text-teacher"
            bg="bg-teacher-light"
          />
        </div>

        {/* My Subjects — empty state */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            My Subjects
          </h2>
          <div
            data-ocid="dashboard.subjects.list"
            className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center"
          >
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">
              No subjects added yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your enrolled subjects will appear here once your teacher adds
              them.
            </p>
          </div>
        </section>

        {/* Parent Verification Code */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Parent Access Code
          </h2>
          <Card
            data-ocid="dashboard.verification.card"
            className="border-border/60 shadow-xs"
          >
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-student-light flex items-center justify-center flex-shrink-0">
                  <KeyRound className="w-6 h-6 text-student" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Share this code with your parent
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your parent needs this code when linking their account to
                    view your progress, grades, and upcoming sessions.
                  </p>
                </div>
                <div
                  data-ocid="dashboard.verification.code"
                  className="flex items-center gap-2 bg-student-light rounded-xl px-5 py-3 self-start sm:self-center"
                >
                  {Array.from(verificationCode).map((digit, i) => {
                    const pos = ["p0", "p1", "p2", "p3", "p4", "p5"][i];
                    return (
                      <span
                        key={pos}
                        className="font-display text-2xl font-bold text-student tabular-nums"
                      >
                        {digit}
                      </span>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Book a Video Call via an Assignment */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            Book a Video Call with Your Teacher
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Find an assignment set by your teacher, select it, and book a video
            call to discuss it and receive your grade.
          </p>

          {/* Search */}
          <div className="mb-5">
            <Input
              data-ocid="booking.search.input"
              type="text"
              placeholder="Search by subject, title or teacher name..."
              value={assignmentSearch}
              onChange={(e) => setAssignmentSearch(e.target.value)}
              className="max-w-md"
            />
          </div>

          {assignments.length === 0 ? (
            <div
              data-ocid="booking.assignments.empty_state"
              className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center"
            >
              <CalendarClock className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium text-muted-foreground">
                No assignments available yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Assignments created by your teacher will appear here. Once one
                is available, you can book a video call.
              </p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div
              data-ocid="booking.assignments.empty_state"
              className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center text-muted-foreground text-sm"
            >
              No assignments match your search.
            </div>
          ) : (
            <div
              data-ocid="booking.assignments.list"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredAssignments.map((a, i) => {
                // Has this student already booked a call for this assignment?
                const alreadyBooked = myBookings.some(
                  (b) => b.assignmentId === a.id,
                );
                return (
                  <div
                    key={a.id}
                    data-ocid={`booking.assignment.item.${i + 1}`}
                    className="card-lift bg-card rounded-xl border border-border/60 shadow-xs p-5 flex flex-col gap-3"
                  >
                    {/* Title + subject */}
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-lg bg-student-light flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ClipboardList className="w-4 h-4 text-student" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground leading-snug">
                          {a.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {a.subject}
                        </p>
                      </div>
                    </div>

                    {/* Teacher + due */}
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-teacher-light text-teacher border-teacher/20"
                      >
                        {a.teacherName}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground"
                      >
                        Due {a.due}
                      </Badge>
                    </div>

                    {/* Book button */}
                    {alreadyBooked ? (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mt-auto pt-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Call booked
                      </div>
                    ) : (
                      <Button
                        data-ocid={`booking.video.button.${i + 1}`}
                        size="sm"
                        className="mt-auto bg-student text-white hover:bg-student/90 gap-1.5"
                        onClick={() => openBooking(a)}
                      >
                        <Video className="w-3.5 h-3.5" />
                        Book Video Call
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* My Classes */}
        <section className="mb-8">
          <button
            type="button"
            data-ocid="student.classes.section.toggle"
            onClick={() => setClassSectionOpen((o) => !o)}
            className="flex items-center gap-2 w-full mb-4 group"
          >
            <School className="w-5 h-5 text-primary" />
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
            <div className="space-y-4">
              {/* Join a class */}
              <div className="bg-card rounded-xl border border-border/60 shadow-xs p-4">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <School className="w-4 h-4 text-primary" />
                  Join a Class
                </h3>
                <div className="flex gap-2">
                  <input
                    data-ocid="student.classes.join.input"
                    type="text"
                    placeholder="Enter class code..."
                    className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono tracking-wider uppercase"
                    value={joinCodeInput}
                    onChange={(e) =>
                      setJoinCodeInput(e.target.value.toUpperCase())
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleJoinClass()}
                    maxLength={6}
                  />
                  <button
                    data-ocid="student.classes.join.button"
                    type="button"
                    onClick={handleJoinClass}
                    disabled={!joinCodeInput.trim()}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  >
                    Join
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Ask your teacher for the 6-character class code.
                </p>
              </div>

              {/* Enrolled classes */}
              {myClasses.length === 0 ? (
                <div
                  data-ocid="student.classes.empty_state"
                  className="bg-card rounded-xl border border-border/60 shadow-xs p-6 text-center"
                >
                  <School className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">
                    You haven't joined any classes yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {myClasses.map((cls, i) => (
                    <div
                      key={cls.id}
                      data-ocid={`student.classes.item.${i + 1}`}
                      className="bg-card rounded-xl border border-border/60 shadow-xs p-4"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-sm text-foreground">
                            {cls.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {cls.subject}
                          </p>
                        </div>
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md tracking-widest">
                          {cls.classCode}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <School className="w-3 h-3" />
                        Teacher: {cls.teacherName}
                      </p>
                      {/* Announcements */}
                      {cls.announcements.length > 0 && (
                        <div className="mt-3 border-t border-border/40 pt-2">
                          <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                            <Megaphone className="w-3 h-3 text-primary" />
                            Announcements
                          </p>
                          <div className="space-y-1.5">
                            {cls.announcements
                              .slice(0, 3)
                              .map((ann: ClassAnnouncement) => (
                                <div
                                  key={ann.id}
                                  className="bg-muted/50 rounded-md px-2.5 py-1.5"
                                >
                                  <p className="text-xs text-foreground">
                                    {ann.text}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {new Date(ann.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            {cls.announcements.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{cls.announcements.length - 3} more
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* My Booked Calls */}
        {myBookings.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">
              My Booked Calls
            </h2>
            <div
              data-ocid="dashboard.bookings.list"
              className="bg-card rounded-xl border border-border/60 shadow-xs divide-y divide-border/60"
            >
              {myBookings.map((b, i) => (
                <div
                  key={b.id}
                  data-ocid={`dashboard.bookings.item.${i + 1}`}
                  className="flex items-center justify-between px-4 py-3.5 gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-student-light flex items-center justify-center flex-shrink-0">
                      <Video className="w-3.5 h-3.5 text-student" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {b.assignmentTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {b.teacherName} &middot; {b.date} at {b.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-xs flex-shrink-0 ${
                        b.status === "completed"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {b.status === "completed" ? "Graded" : "Pending"}
                    </Badge>
                    <Button
                      data-ocid={`dashboard.bookings.chat.button.${i + 1}`}
                      size="sm"
                      variant="outline"
                      className="gap-1.5 flex-shrink-0 relative"
                      onClick={() => {
                        setActiveChatBookingId(b.id);
                        markChatRead(b.id, "student");
                        setUnreadCounts((prev) => ({ ...prev, [b.id]: 0 }));
                      }}
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
          </section>
        )}

        {/* My Grades */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            My Grades
          </h2>
          {myGrades.length === 0 ? (
            <div
              data-ocid="dashboard.grades.table"
              className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center"
            >
              <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium text-muted-foreground">
                No grades recorded yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Grades will appear here once your teacher marks your work after
                your video call.
              </p>
            </div>
          ) : (
            <div
              data-ocid="dashboard.grades.table"
              className="bg-card rounded-xl border border-border/60 shadow-xs divide-y divide-border/60"
            >
              {myGrades.map((g, i) => (
                <div
                  key={g.id}
                  data-ocid={`dashboard.grades.item.${i + 1}`}
                  className="flex items-center justify-between px-4 py-4 gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-teacher-light flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-4 h-4 text-teacher" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {g.assignmentTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {g.subject} &middot; {g.teacherName}
                      </p>
                      {g.feedback && (
                        <p className="text-xs text-muted-foreground mt-0.5 italic">
                          "{g.feedback}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-display text-xl font-bold text-teacher">
                      {g.grade}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My Quizzes */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-student" />
            My Quizzes
          </h2>
          {myQuizzes.length === 0 ? (
            <div
              data-ocid="quiz.my.empty_state"
              className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center"
            >
              <ClipboardCheck className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium text-muted-foreground">
                No quizzes assigned yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your teacher will assign quizzes and tests here.
              </p>
            </div>
          ) : (
            <div
              data-ocid="quiz.my.list"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {myQuizzes.map(({ quiz, assignment }, i) => {
                const used = getAttemptsUsed(quiz.id, student.username);
                const allowed = quiz.settings.attemptsAllowed;
                const hasAttempts = allowed === 0 || used < allowed;
                const isDone = allowed > 0 && used >= allowed;
                return (
                  <div
                    key={assignment.id}
                    data-ocid={`quiz.my.item.${i + 1}`}
                    className="bg-card border border-border/60 rounded-xl p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-lg bg-student-light flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ClipboardCheck className="w-4 h-4 text-student" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground leading-snug">
                          {quiz.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {quiz.subject} · {quiz.gradeLevel}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        variant="outline"
                        className={`text-xs ${quiz.type === "test" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
                      >
                        {quiz.type === "test" ? "Test" : "Quiz"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground"
                      >
                        {quiz.teacherName}
                      </Badge>
                      {quiz.settings.dueDate && (
                        <Badge
                          variant="outline"
                          className="text-xs text-muted-foreground"
                        >
                          Due {quiz.settings.dueDate}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-xs ${isDone ? "bg-green-50 text-green-700 border-green-200" : used > 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-muted text-muted-foreground"}`}
                      >
                        {isDone
                          ? "Completed"
                          : used > 0
                            ? "In Progress"
                            : "Not Started"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Attempts: {used}
                      {allowed > 0 ? ` / ${allowed}` : " (unlimited)"}
                    </p>
                    {hasAttempts ? (
                      <Button
                        data-ocid={`quiz.my.take.button.${i + 1}`}
                        size="sm"
                        className="mt-auto bg-student hover:bg-student/90 text-white gap-1.5"
                        onClick={() => setTakingQuiz({ quiz, assignment })}
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        {used > 0 ? "Retake" : "Take Quiz"}
                      </Button>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-auto pt-1 font-medium">
                        ✓ All attempts used
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Learning Games */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Learning Games 🎮
          </h2>
          <LearningGames />
        </section>
      </main>

      {activeChatBookingId &&
        (() => {
          const b = myBookings.find((x) => x.id === activeChatBookingId);
          if (!b) return null;
          return (
            <ChatWindow
              bookingId={b.id}
              bookingLabel={`${b.assignmentTitle} with ${b.teacherName}`}
              senderRole="student"
              senderName={student.name}
              onClose={() => setActiveChatBookingId(null)}
            />
          );
        })()}

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent data-ocid="booking.dialog" className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Book a Video Call</DialogTitle>
          </DialogHeader>

          {selectedAssignment && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/40 rounded-lg px-4 py-3 space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Assignment:</span>{" "}
                  {selectedAssignment.title}
                </p>
                <p>
                  <span className="font-semibold">Subject:</span>{" "}
                  {selectedAssignment.subject}
                </p>
                <p>
                  <span className="font-semibold">Teacher:</span>{" "}
                  {selectedAssignment.teacherName}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-date">Date</Label>
                <Input
                  data-ocid="booking.date.input"
                  id="booking-date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-time">Time</Label>
                <Input
                  data-ocid="booking.time.input"
                  id="booking-time"
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              data-ocid="booking.cancel_button"
              variant="outline"
              onClick={cancelBooking}
            >
              Cancel
            </Button>
            <Button
              data-ocid="booking.confirm_button"
              className="bg-student text-white hover:bg-student/90"
              onClick={confirmBooking}
              disabled={!bookingDate || !bookingTime}
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
      {/* Quiz Taker */}
      {takingQuiz && (
        <QuizTaker
          open={!!takingQuiz}
          onClose={() => {
            setTakingQuiz(null);
            setMyQuizzes(getAssignedQuizzesForStudent(student.username));
          }}
          quiz={takingQuiz.quiz}
          assignment={takingQuiz.assignment}
          studentUsername={student.username}
          studentName={student.name}
        />
      )}

      {reportOpen && (
        <ReportUser
          reporterRole="student"
          reporterName={student.name}
          onClose={() => setReportOpen(false)}
        />
      )}

      <AiDoubtBot />
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
    <div className="bg-card rounded-xl border border-border/60 shadow-xs p-4">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
    </div>
  );
}
