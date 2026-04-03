import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Flag,
  GraduationCap,
  Headphones,
  MessageSquare,
  PlusCircle,
  Send,
  Star,
  User,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type CallBooking,
  type Grade,
  getBookingsForStudent,
  getGradesForStudent,
  getUnreadCount,
  markChatRead,
} from "../utils/assignmentStorage";
import { addReview } from "../utils/reviewStorage";
import type { LinkedStudent } from "../utils/studentStorage";
import {
  type TpChatMessage,
  getTpMessages,
  isParentBanned,
  sendTpMessage,
} from "../utils/supportStorage";
import {
  type TeacherProfile,
  getTeacherProfileByName,
} from "../utils/teacherProfileStorage";
import { ChatWindow } from "./ChatWindow";
import { DashboardNav } from "./DashboardNav";
import { ReportUser } from "./ReportUser";
import { SupportPortal } from "./SupportPortal";

type Props = {
  onLogout: () => void;
  linkedStudentName?: string;
  linkedStudentUsername?: string;
  allLinkedStudents?: LinkedStudent[];
  activeStudentUsername?: string;
  onSwitchStudent?: (username: string) => void;
  onAddStudent?: () => void;
};

export function ParentDashboard({
  onLogout,
  linkedStudentName,
  linkedStudentUsername,
  allLinkedStudents = [],
  onSwitchStudent,
  onAddStudent,
}: Props) {
  const childName = linkedStudentName || "your child";
  const parentPrincipal =
    localStorage.getItem("tuitions_parent_principal") ??
    linkedStudentUsername ??
    "";

  const [supportOpen, setSupportOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [switchDropdownOpen, setSwitchDropdownOpen] = useState(false);

  // Parent ban check
  useEffect(() => {
    function checkBan() {
      const p = localStorage.getItem("tuitions_parent_principal") ?? "";
      if (p && isParentBanned(p)) {
        toast.error("Your account has been banned by the admin.");
        onLogout();
      }
    }
    checkBan();
    const id = setInterval(checkBan, 5000);
    return () => clearInterval(id);
  }, [onLogout]);

  const [grades, setGrades] = useState<Grade[]>(() =>
    linkedStudentUsername ? getGradesForStudent(linkedStudentUsername) : [],
  );

  const [bookings, setBookings] = useState<CallBooking[]>(() =>
    linkedStudentUsername ? getBookingsForStudent(linkedStudentUsername) : [],
  );

  // Active chat window state
  const [activeChatBookingId, setActiveChatBookingId] = useState<string | null>(
    null,
  );
  const [activeChatLabel, setActiveChatLabel] = useState("");

  // Unread counts per booking id
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Review form state
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  // Teacher profile modal state
  const [viewingTeacherProfile, setViewingTeacherProfile] =
    useState<TeacherProfile | null>(null);
  const [viewingTeacherName, setViewingTeacherName] = useState<string>("");

  // Teacher-Parent direct chat state
  const [tpChatBookingId, setTpChatBookingId] = useState<string | null>(null);
  const [tpMessages, setTpMessages] = useState<TpChatMessage[]>([]);
  const [tpInput, setTpInput] = useState("");
  const [tpPollRef] = useState<{
    interval: ReturnType<typeof setInterval> | null;
  }>({ interval: null });

  function openTpChat(b: { id: string; teacherName: string }) {
    const channel = `tp:${b.teacherName}:${linkedStudentUsername ?? ""}`;
    setTpChatBookingId(b.id);
    setTpMessages(getTpMessages(channel));
    if (tpPollRef.interval) clearInterval(tpPollRef.interval);
    tpPollRef.interval = setInterval(() => {
      setTpMessages(getTpMessages(channel));
    }, 1500);
  }

  function closeTpChat() {
    setTpChatBookingId(null);
    setTpMessages([]);
    setTpInput("");
    if (tpPollRef.interval) {
      clearInterval(tpPollRef.interval);
      tpPollRef.interval = null;
    }
  }

  function sendTpMsg(teacherName: string) {
    if (!tpInput.trim()) return;
    const channel = `tp:${teacherName}:${linkedStudentUsername ?? ""}`;
    const senderName = linkedStudentName
      ? `Parent of ${linkedStudentName}`
      : "Parent";
    sendTpMessage(channel, "parent", senderName, tpInput.trim());
    setTpInput("");
    setTpMessages(getTpMessages(channel));
  }

  const parentSenderName = linkedStudentName
    ? `Parent of ${linkedStudentName}`
    : "Parent";

  // Refresh grades and bookings every 5s
  useEffect(() => {
    if (!linkedStudentUsername) return;
    function refresh() {
      setGrades(getGradesForStudent(linkedStudentUsername!));
      setBookings(getBookingsForStudent(linkedStudentUsername!));
    }
    window.addEventListener("focus", refresh);
    const interval = setInterval(refresh, 5000);
    return () => {
      window.removeEventListener("focus", refresh);
      clearInterval(interval);
    };
  }, [linkedStudentUsername]);

  // Poll unread counts every 3s
  useEffect(() => {
    function refreshUnread() {
      const counts: Record<string, number> = {};
      for (const b of bookings) {
        counts[b.id] = getUnreadCount(b.id, "parent");
      }
      setUnreadCounts(counts);
    }
    refreshUnread();
    const interval = setInterval(refreshUnread, 3000);
    return () => clearInterval(interval);
  }, [bookings]);

  function openChat(b: CallBooking) {
    markChatRead(b.id, "parent");
    setUnreadCounts((prev) => ({ ...prev, [b.id]: 0 }));
    setActiveChatBookingId(b.id);
    setActiveChatLabel(`${b.teacherName} — ${b.assignmentTitle}`);
  }

  function openTeacherProfile(teacherName: string) {
    const profile = getTeacherProfileByName(teacherName);
    setViewingTeacherName(teacherName);
    setViewingTeacherProfile(profile);
  }

  function handleSubmitReview() {
    if (rating === 0 || reviewText.trim() === "") return;
    const parentName = linkedStudentName
      ? `Parent of ${linkedStudentName}`
      : "A Parent";
    addReview({
      parentName,
      studentName: linkedStudentName || "",
      reviewText: reviewText.trim(),
      rating,
    });
    toast.success("Review submitted! Thank you.");
    setRating(0);
    setReviewText("");
  }

  // Compute average grade (numeric grades only)
  const avgGrade = (() => {
    const numeric = grades
      .map((g) => Number.parseFloat(g.grade))
      .filter((n) => !Number.isNaN(n));
    if (numeric.length === 0) return null;
    return (numeric.reduce((a, b) => a + b, 0) / numeric.length).toFixed(1);
  })();

  // Unique subjects from grades
  const subjects = Array.from(new Set(grades.map((g) => g.subject)));

  // Profile has meaningful content
  const profileHasContent =
    viewingTeacherProfile &&
    (viewingTeacherProfile.profilePicture ||
      (viewingTeacherProfile.awards &&
        viewingTeacherProfile.awards.length > 0) ||
      viewingTeacherProfile.hasTeachedBefore !== undefined);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNav
        userRole="Parent"
        onLogout={onLogout}
        headerClass="dashboard-header-parent"
      />

      {/* Header action row: student name + switch + support + report */}
      <div className="dashboard-header-parent px-4 sm:px-6 pt-2 pb-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Student name + Switch Student dropdown */}
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-white/70" />
            <span className="text-white text-xs font-semibold">
              {childName}
            </span>
            {allLinkedStudents.length > 1 && (
              <div className="relative">
                <button
                  type="button"
                  data-ocid="parent.switch_student.button"
                  onClick={() => setSwitchDropdownOpen((o) => !o)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors"
                >
                  Switch Student
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${switchDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {switchDropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-10"
                      role="button"
                      tabIndex={-1}
                      aria-label="Close student switcher"
                      onClick={() => setSwitchDropdownOpen(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setSwitchDropdownOpen(false);
                      }}
                    />
                    <div className="absolute left-0 top-full mt-1.5 z-20 min-w-[160px] bg-white rounded-xl shadow-lg border border-primary/10 py-1 overflow-hidden">
                      {allLinkedStudents.map((s) => {
                        const isActive =
                          s.username.toLowerCase() ===
                          linkedStudentUsername?.toLowerCase();
                        return (
                          <button
                            key={s.username}
                            type="button"
                            data-ocid={`parent.switch_student.option.${s.username}`}
                            onClick={() => {
                              onSwitchStudent?.(s.username);
                              setSwitchDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center justify-between gap-3 transition-colors ${
                              isActive
                                ? "bg-primary text-white"
                                : "text-primary hover:bg-primary/5"
                            }`}
                          >
                            {s.name}
                            {isActive && (
                              <span className="text-[10px] font-bold uppercase tracking-wide opacity-75">
                                Active
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Support & Report */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-ocid="parent.support.button"
              onClick={() => setSupportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors"
            >
              <Headphones className="w-3.5 h-3.5" />
              Support
            </button>
            <button
              type="button"
              data-ocid="parent.report.open_modal_button"
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              Report User
            </button>
          </div>
        </div>
      </div>

      {/* Welcome banner */}
      <div className="dashboard-header-parent px-4 sm:px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Welcome back! 👋
          </h1>
          <p className="text-white/70 text-sm">
            Staying informed about {childName}'s academic progress.
          </p>
          {/* Add Student link */}
          {allLinkedStudents.length > 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => onAddStudent?.()}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/30"
              >
                <PlusCircle className="w-3 h-3" />
                Add Student
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full -mt-4">
        {/* Child Progress Card */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Child Progress
          </h2>
          <Card className="border-border/60 shadow-xs">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-parent-light flex items-center justify-center text-2xl">
                    👧
                  </div>
                  <div>
                    <p className="font-display font-bold text-xl text-foreground">
                      {childName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Linked student account
                    </p>
                  </div>
                </div>

                {/* Metrics from real data */}
                <div className="flex-1 grid grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Overall Grade
                    </p>
                    <p className="text-sm font-bold text-teacher">
                      {avgGrade !== null ? avgGrade : "— (not yet available)"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Grades Received
                    </p>
                    <p className="text-sm font-bold text-parent">
                      {grades.length > 0
                        ? grades.length
                        : "— (not yet available)"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={BookOpen}
            label="Subjects"
            value={subjects.length > 0 ? String(subjects.length) : "—"}
            color="text-teacher"
            bg="bg-teacher-light"
          />
          <StatCard
            icon={BarChart3}
            label="Avg. Grade"
            value={avgGrade !== null ? avgGrade : "—"}
            color="text-parent"
            bg="bg-parent-light"
          />
          <StatCard
            icon={CheckCircle2}
            label="Grades Received"
            value={grades.length > 0 ? String(grades.length) : "—"}
            color="text-student"
            bg="bg-student-light"
          />
        </div>

        {/* Booked Sessions */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Booked Sessions
          </h2>
          {bookings.length === 0 ? (
            <div
              data-ocid="dashboard.sessions.empty_state"
              className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center"
            >
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium text-muted-foreground">
                No sessions booked yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sessions booked by {childName} will appear here.
              </p>
            </div>
          ) : (
            <div
              data-ocid="dashboard.sessions.list"
              className="bg-card rounded-xl border border-border/60 shadow-xs divide-y divide-border/60"
            >
              {bookings.map((b, i) => (
                <div key={b.id} data-ocid={`dashboard.sessions.item.${i + 1}`}>
                  <div className="flex items-center justify-between px-4 py-3.5 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-parent-light flex items-center justify-center flex-shrink-0">
                        <Video className="w-3.5 h-3.5 text-parent" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {b.assignmentTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {b.teacherName} &middot; {b.subject} &middot; {b.date}{" "}
                          at {b.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          b.status === "completed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {b.status === "completed" ? "Graded" : "Pending"}
                      </Badge>
                      <Button
                        data-ocid="parent.teacher_profile.open_modal_button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs border-parent/30 text-parent hover:bg-parent-light"
                        onClick={() => openTeacherProfile(b.teacherName)}
                      >
                        <User className="w-3.5 h-3.5" />
                        Teacher Profile
                      </Button>
                      <Button
                        data-ocid={`dashboard.sessions.messages.button.${i + 1}`}
                        size="sm"
                        variant="outline"
                        className="relative gap-1.5 text-xs"
                        onClick={() => openChat(b)}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Messages
                        {(unreadCounts[b.id] ?? 0) > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                            {unreadCounts[b.id]}
                          </span>
                        )}
                      </Button>
                      <Button
                        data-ocid={`parent.tp_chat.button.${i + 1}`}
                        size="sm"
                        variant={
                          tpChatBookingId === b.id ? "default" : "outline"
                        }
                        className={
                          tpChatBookingId === b.id
                            ? "gap-1.5 text-xs bg-teacher hover:bg-teacher/90 text-white"
                            : "gap-1.5 text-xs border-teacher/30 text-teacher hover:bg-teacher-light"
                        }
                        onClick={() => {
                          if (tpChatBookingId === b.id) {
                            closeTpChat();
                          } else {
                            openTpChat(b);
                          }
                        }}
                      >
                        <Send className="w-3.5 h-3.5" />
                        {tpChatBookingId === b.id ? "Close" : "Chat Teacher"}
                      </Button>
                    </div>
                  </div>
                  {tpChatBookingId === b.id && (
                    <div className="border-t border-border/40 p-4 bg-muted/30">
                      <p className="text-xs font-semibold text-teacher mb-2">
                        Private chat with {b.teacherName}
                      </p>
                      <div
                        className="h-44 overflow-y-auto mb-3 space-y-2 bg-card rounded-lg p-3 border border-border/40"
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
                              className={`flex ${msg.senderRole === "parent" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[75%] px-3 py-1.5 rounded-xl text-xs ${msg.senderRole === "parent" ? "bg-parent text-white rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}
                              >
                                <p className="font-semibold mb-0.5 opacity-75">
                                  {msg.senderName}
                                </p>
                                <p>{msg.text}</p>
                                <p className="text-[10px] mt-0.5 opacity-60">
                                  {new Date(msg.sentAt).toLocaleTimeString([], {
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
                          data-ocid="parent.tp_chat.input"
                          type="text"
                          value={tpInput}
                          onChange={(e) => setTpInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              sendTpMsg(b.teacherName);
                            }
                          }}
                          placeholder="Type a message to the teacher..."
                          className="flex-1 h-8 text-xs px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-parent/50"
                        />
                        <Button
                          data-ocid="parent.tp_chat.submit_button"
                          size="sm"
                          className="h-8 bg-teacher hover:bg-teacher/90 text-white gap-1"
                          onClick={() => sendTpMsg(b.teacherName)}
                        >
                          <Send className="w-3 h-3" />
                          Send
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Grades section */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Grades &amp; Feedback
          </h2>
          {grades.length === 0 ? (
            <div
              data-ocid="dashboard.grades.empty_state"
              className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center"
            >
              <GraduationCap className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium text-muted-foreground">
                No grades yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Grades will appear here once the teacher assigns them.
              </p>
            </div>
          ) : (
            <div
              data-ocid="dashboard.grades.list"
              className="bg-card rounded-xl border border-border/60 shadow-xs divide-y divide-border/60"
            >
              {grades.map((g, i) => (
                <div
                  key={g.id}
                  data-ocid={`dashboard.grades.item.${i + 1}`}
                  className="flex items-center justify-between px-4 py-3.5 gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-teacher-light flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-3.5 h-3.5 text-teacher" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {g.assignmentTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {g.subject}
                        {g.feedback ? ` — ${g.feedback}` : ""}
                      </p>
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

        {/* Write a Review */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Write a Review
          </h2>
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">
                Share your experience with Tuition Skill
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Star rating */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Your rating
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      data-ocid={`review.star.toggle.${star}`}
                      className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      <Star
                        className="w-7 h-7"
                        fill={
                          star <= (hoveredStar || rating)
                            ? "#f59e0b"
                            : "transparent"
                        }
                        stroke={
                          star <= (hoveredStar || rating)
                            ? "#f59e0b"
                            : "currentColor"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review text */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Your review
                </p>
                <Textarea
                  data-ocid="review.textarea"
                  placeholder="Tell us about your experience as a parent on Tuition Skill..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <Button
                data-ocid="review.submit_button"
                onClick={handleSubmitReview}
                disabled={rating === 0 || reviewText.trim() === ""}
                className="bg-parent hover:bg-parent/90 text-white font-semibold"
              >
                Submit Review
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Teacher Profile Modal */}
      <Dialog
        open={viewingTeacherProfile !== null || viewingTeacherName !== ""}
        onOpenChange={(open) => {
          if (!open) {
            setViewingTeacherProfile(null);
            setViewingTeacherName("");
          }
        }}
      >
        <DialogContent
          data-ocid="parent.teacher_profile.modal"
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <User className="w-5 h-5 text-parent" />
              {viewingTeacherName || "Teacher"}'s Profile
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {!profileHasContent ? (
              <div className="flex flex-col items-center py-6 gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-7 h-7 text-muted-foreground opacity-50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No profile information available yet.
                </p>
              </div>
            ) : (
              <>
                {/* Profile picture */}
                {viewingTeacherProfile?.profilePicture && (
                  <div className="flex justify-center">
                    <img
                      src={viewingTeacherProfile.profilePicture}
                      alt={`${viewingTeacherName}'s profile`}
                      className="w-24 h-24 rounded-full object-cover border-4 border-parent/20"
                    />
                  </div>
                )}

                {/* Has taught before */}
                {viewingTeacherProfile?.hasTeachedBefore !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Has taught before:
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        viewingTeacherProfile.hasTeachedBefore
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }
                    >
                      {viewingTeacherProfile.hasTeachedBefore ? "Yes" : "No"}
                    </Badge>
                  </div>
                )}

                {/* Awards */}
                {viewingTeacherProfile?.awards &&
                  viewingTeacherProfile.awards.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-parent" />
                        Awards &amp; Achievements
                      </p>
                      <div className="space-y-2">
                        {viewingTeacherProfile.awards.map((aw) => (
                          <div
                            key={aw.id}
                            className="bg-muted/40 rounded-lg px-3 py-2.5"
                          >
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
                        ))}
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              data-ocid="parent.teacher_profile.close_button"
              variant="outline"
              onClick={() => {
                setViewingTeacherProfile(null);
                setViewingTeacherName("");
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Chat Window */}
      {activeChatBookingId && (
        <ChatWindow
          bookingId={activeChatBookingId}
          bookingLabel={activeChatLabel}
          senderRole="parent"
          senderName={parentSenderName}
          onClose={() => setActiveChatBookingId(null)}
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
      {/* Support Portal */}
      {supportOpen && (
        <SupportPortal
          senderRole="parent"
          senderName={`Parent of ${childName}`}
          senderPrincipal={parentPrincipal}
          onClose={() => setSupportOpen(false)}
        />
      )}

      {/* Report User */}
      {reportOpen && (
        <ReportUser
          reporterRole="parent"
          reporterName={`Parent of ${childName}`}
          onClose={() => setReportOpen(false)}
        />
      )}
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
