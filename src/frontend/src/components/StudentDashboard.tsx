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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  KeyRound,
  Phone,
  Video,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { StudentUser } from "../App";
import { getOrCreateVerificationCode } from "../utils/studentStorage";
import { DashboardNav } from "./DashboardNav";

type Props = {
  student: StudentUser;
  onLogout: () => void;
};

const subjects = [
  {
    id: 1,
    name: "Advanced Mathematics",
    teacher: "Mr. Robert Hayes",
    next: "Mon, 10 Mar · 4:00 PM",
    color: "bg-student-light",
    dot: "bg-student",
  },
  {
    id: 2,
    name: "Physics",
    teacher: "Dr. Priya Sharma",
    next: "Tue, 11 Mar · 3:30 PM",
    color: "bg-teacher-light",
    dot: "bg-teacher",
  },
  {
    id: 3,
    name: "English Literature",
    teacher: "Ms. Claire Watson",
    next: "Wed, 12 Mar · 5:00 PM",
    color: "bg-parent-light",
    dot: "bg-parent",
  },
  {
    id: 4,
    name: "Chemistry",
    teacher: "Mr. David Chen",
    next: "Thu, 13 Mar · 4:30 PM",
    color: "bg-secondary",
    dot: "bg-primary",
  },
];

const assignments = [
  {
    id: 1,
    title: "Quadratic Equations Practice Set",
    subject: "Mathematics",
    due: "10 Mar 2026",
    status: "pending",
  },
  {
    id: 2,
    title: "Newton's Laws Lab Report",
    subject: "Physics",
    due: "12 Mar 2026",
    status: "submitted",
  },
  {
    id: 3,
    title: "Hamlet Essay — Act III Analysis",
    subject: "English Lit.",
    due: "14 Mar 2026",
    status: "pending",
  },
  {
    id: 4,
    title: "Periodic Table Element Study",
    subject: "Chemistry",
    due: "8 Mar 2026",
    status: "overdue",
  },
  {
    id: 5,
    title: "Trigonometry Problem Sheet",
    subject: "Mathematics",
    due: "18 Mar 2026",
    status: "pending",
  },
];

const grades = [
  {
    id: 1,
    assignment: "Integration Techniques",
    subject: "Mathematics",
    score: "92/100",
    feedback: "Excellent working shown.",
  },
  {
    id: 2,
    assignment: "Wave Motion Analysis",
    subject: "Physics",
    score: "85/100",
    feedback: "Good understanding of concepts.",
  },
  {
    id: 3,
    assignment: "Macbeth Character Study",
    subject: "English Lit.",
    score: "88/100",
    feedback: "Strong textual analysis.",
  },
  {
    id: 4,
    assignment: "Acid-Base Titration",
    subject: "Chemistry",
    score: "78/100",
    feedback: "Calculation errors in part C.",
  },
  {
    id: 5,
    assignment: "Calculus Fundamentals",
    subject: "Mathematics",
    score: "95/100",
    feedback: "Outstanding performance!",
  },
];

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-parent-light text-parent border-parent/30",
  },
  submitted: {
    label: "Submitted",
    className: "bg-teacher-light text-teacher border-teacher/30",
  },
  overdue: {
    label: "Overdue",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

const teachers = [
  {
    id: 1,
    name: "Mr. Robert Hayes",
    subjects: ["Mathematics", "Further Mathematics"],
    availability: "Available",
  },
  {
    id: 2,
    name: "Dr. Priya Sharma",
    subjects: ["Physics", "Chemistry"],
    availability: "Available",
  },
  {
    id: 3,
    name: "Ms. Claire Watson",
    subjects: ["English Literature", "History"],
    availability: "Busy",
  },
  {
    id: 4,
    name: "Mr. David Chen",
    subjects: ["Chemistry", "Biology"],
    availability: "Available",
  },
  {
    id: 5,
    name: "Mrs. Susan Patel",
    subjects: ["Mathematics", "Biology"],
    availability: "Offline",
  },
  {
    id: 6,
    name: "Mr. James Ford",
    subjects: ["History", "English Literature"],
    availability: "Busy",
  },
];

type BookingState = {
  teacher: (typeof teachers)[number];
  callType: "Video" | "Audio";
} | null;

function StatusBadge({ status }: { status: string }) {
  const config =
    statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;
  return (
    <Badge
      variant="outline"
      className={`text-xs font-semibold border ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}

export function StudentDashboard({ student, onLogout }: Props) {
  const duePending = assignments.filter((a) => a.status === "pending").length;
  const verificationCode = useMemo(
    () => getOrCreateVerificationCode(student.username),
    [student.username],
  );

  // Book a Call state
  const [subjectSearch, setSubjectSearch] = useState("");
  const [booking, setBooking] = useState<BookingState>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredTeachers = useMemo(() => {
    const q = subjectSearch.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter((t) =>
      t.subjects.some((s) => s.toLowerCase().includes(q)),
    );
  }, [subjectSearch]);

  function openBookingDialog(
    teacher: (typeof teachers)[number],
    callType: "Video" | "Audio",
  ) {
    setBooking({ teacher, callType });
    setBookingDate("");
    setBookingTime("");
    setDialogOpen(true);
  }

  function confirmBooking() {
    if (!booking) return;
    setDialogOpen(false);
    toast.success(`Call booked with ${booking.teacher.name}!`);
    setBooking(null);
    setBookingDate("");
    setBookingTime("");
  }

  function cancelBooking() {
    setDialogOpen(false);
    setBooking(null);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNav
        userRole="Student"
        userName={student.name}
        onLogout={onLogout}
        headerClass="dashboard-header-student"
      />

      {/* Welcome banner */}
      <div className="dashboard-header-student px-4 sm:px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Welcome back, {student.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-white/70 text-sm">
            Here's your learning overview for this week.
          </p>
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full -mt-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={BookOpen}
            label="Subjects Enrolled"
            value="4"
            color="text-student"
            bg="bg-student-light"
          />
          <StatCard
            icon={ClipboardList}
            label="Assignments Due"
            value={String(duePending)}
            color="text-parent"
            bg="bg-parent-light"
          />
          <StatCard
            icon={BarChart3}
            label="Average Grade"
            value="87.6%"
            color="text-teacher"
            bg="bg-teacher-light"
          />
        </div>

        {/* My Subjects */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            My Subjects
          </h2>
          <div
            data-ocid="dashboard.subjects.list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {subjects.map((s, i) => (
              <div
                key={s.id}
                data-ocid={`dashboard.subjects.item.${i + 1}`}
                className="card-lift bg-card rounded-xl border border-border/60 shadow-xs p-4"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-3`}
                >
                  <BookOpen
                    className={`w-4 h-4 ${s.dot.replace("bg-", "text-")}`}
                  />
                </div>
                <p className="font-semibold text-sm text-foreground mb-1 leading-tight">
                  {s.name}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {s.teacher}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {s.next}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Assignments */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            My Assignments
          </h2>
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
                  <div
                    className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      a.status === "submitted"
                        ? "bg-teacher-light"
                        : a.status === "overdue"
                          ? "bg-destructive/10"
                          : "bg-parent-light"
                    }`}
                  >
                    {a.status === "submitted" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teacher" />
                    ) : a.status === "overdue" ? (
                      <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-parent" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {a.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{a.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    Due {a.due}
                  </span>
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}
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

        {/* Grades */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            My Grades
          </h2>
          <div
            data-ocid="dashboard.grades.table"
            className="bg-card rounded-xl border border-border/60 shadow-xs overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-semibold text-foreground">
                    Assignment
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Subject
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-center">
                    Score
                  </TableHead>
                  <TableHead className="font-semibold text-foreground hidden sm:table-cell">
                    Feedback
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((g, i) => (
                  <TableRow
                    key={g.id}
                    data-ocid={`dashboard.grades.row.${i + 1}`}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium text-sm">
                      {g.assignment}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {g.subject}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-semibold text-teacher">
                        {g.score}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                      {g.feedback}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Book a Call with a Teacher */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Book a Call with a Teacher
          </h2>

          {/* Subject search */}
          <div className="mb-5">
            <Input
              data-ocid="booking.search.input"
              type="text"
              placeholder="Search by subject (e.g. Mathematics)"
              value={subjectSearch}
              onChange={(e) => setSubjectSearch(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Teacher cards */}
          {filteredTeachers.length === 0 ? (
            <div
              data-ocid="booking.teachers.empty_state"
              className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center text-muted-foreground text-sm"
            >
              No teachers found for that subject.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeachers.map((teacher, i) => {
                const availColor =
                  teacher.availability === "Available"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : teacher.availability === "Busy"
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-muted text-muted-foreground border-border";

                return (
                  <div
                    key={teacher.id}
                    data-ocid={`booking.teacher.item.${i + 1}`}
                    className="card-lift bg-card rounded-xl border border-border/60 shadow-xs p-5 flex flex-col gap-3"
                  >
                    {/* Name + availability */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-foreground leading-snug">
                        {teacher.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs font-semibold border shrink-0 ${availColor}`}
                      >
                        {teacher.availability}
                      </Badge>
                    </div>

                    {/* Subject pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.subjects.map((subj) => (
                        <Badge
                          key={subj}
                          variant="secondary"
                          className="text-xs bg-student-light text-student border-student/20"
                        >
                          {subj}
                        </Badge>
                      ))}
                    </div>

                    {/* Call buttons */}
                    <div className="flex gap-2 mt-auto pt-1">
                      <Button
                        data-ocid={`booking.video.button.${i + 1}`}
                        size="sm"
                        className="flex-1 bg-student text-white hover:bg-student/90 gap-1.5"
                        onClick={() => openBookingDialog(teacher, "Video")}
                      >
                        <Video className="w-3.5 h-3.5" />
                        Video Call
                      </Button>
                      <Button
                        data-ocid={`booking.audio.button.${i + 1}`}
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5"
                        onClick={() => openBookingDialog(teacher, "Audio")}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Audio Call
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Booking Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent data-ocid="booking.dialog" className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Book a {booking?.callType ?? ""} Call</DialogTitle>
            </DialogHeader>

            {booking && (
              <div className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground">
                  You are booking a{" "}
                  <span className="font-semibold text-foreground">
                    {booking.callType} call
                  </span>{" "}
                  with{" "}
                  <span className="font-semibold text-foreground">
                    {booking.teacher.name}
                  </span>
                  .
                </p>
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
      </main>

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
