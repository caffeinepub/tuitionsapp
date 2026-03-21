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
  ClipboardList,
  GraduationCap,
  MessageSquare,
  Star,
  User,
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
import {
  type TeacherProfile,
  getTeacherProfileByName,
} from "../utils/teacherProfileStorage";
import { ChatWindow } from "./ChatWindow";
import { DashboardNav } from "./DashboardNav";

type Props = {
  onLogout: () => void;
  linkedStudentName?: string;
  linkedStudentUsername?: string;
};

export function ParentDashboard({
  onLogout,
  linkedStudentName,
  linkedStudentUsername,
}: Props) {
  const childName = linkedStudentName || "your child";

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

      {/* Welcome banner */}
      <div className="dashboard-header-parent px-4 sm:px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Welcome back! 👋
          </h1>
          <p className="text-white/70 text-sm">
            Staying informed about {childName}'s academic progress.
          </p>
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
                <div
                  key={b.id}
                  data-ocid={`dashboard.sessions.item.${i + 1}`}
                  className="flex items-center justify-between px-4 py-3.5 gap-4"
                >
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
                  </div>
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
                Share your experience with TuitionsApp
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
                  placeholder="Tell us about your experience as a parent on TuitionsApp..."
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
