import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
} from "lucide-react";
import { DashboardNav } from "./DashboardNav";

type Props = {
  onLogout: () => void;
  linkedStudentName?: string;
};

const DEFAULT_CHILD = {
  id: 1,
  name: "Emma Johnson",
  year: "Year 11",
  overallGrade: 88,
  attendance: 94,
  subjects: 5,
  color: "text-student",
  bg: "bg-student-light",
};

const upcomingSessions = [
  {
    id: 1,
    subject: "Advanced Mathematics",
    teacher: "Mr. Robert Hayes",
    date: "Mon, 10 Mar",
    time: "4:00 PM",
    type: "Tutorial",
  },
  {
    id: 2,
    subject: "Physics",
    teacher: "Dr. Priya Sharma",
    date: "Tue, 11 Mar",
    time: "3:30 PM",
    type: "Lab Session",
  },
  {
    id: 3,
    subject: "English Literature",
    teacher: "Ms. Claire Watson",
    date: "Wed, 12 Mar",
    time: "5:00 PM",
    type: "Essay Review",
  },
  {
    id: 4,
    subject: "Chemistry",
    teacher: "Mr. David Chen",
    date: "Thu, 13 Mar",
    time: "4:30 PM",
    type: "Tutorial",
  },
];

const recentGrades = [
  {
    id: 1,
    subject: "Mathematics",
    assignment: "Integration Techniques",
    score: "92/100",
    grade: "A",
    trend: "up",
  },
  {
    id: 2,
    subject: "Physics",
    assignment: "Wave Motion Analysis",
    score: "85/100",
    grade: "B+",
    trend: "stable",
  },
  {
    id: 3,
    subject: "English Lit.",
    assignment: "Macbeth Character Study",
    score: "88/100",
    grade: "A-",
    trend: "up",
  },
  {
    id: 4,
    subject: "Chemistry",
    assignment: "Acid-Base Titration",
    score: "78/100",
    grade: "B",
    trend: "down",
  },
  {
    id: 5,
    subject: "Mathematics",
    assignment: "Calculus Fundamentals",
    score: "95/100",
    grade: "A+",
    trend: "up",
  },
];

const gradeColors: Record<string, string> = {
  "A+": "text-teacher font-bold",
  A: "text-teacher font-bold",
  "A-": "text-teacher",
  "B+": "text-primary font-medium",
  B: "text-primary",
  "B-": "text-parent",
  C: "text-muted-foreground",
};

export function ParentDashboard({ onLogout, linkedStudentName }: Props) {
  const child = linkedStudentName
    ? { ...DEFAULT_CHILD, name: linkedStudentName }
    : DEFAULT_CHILD;

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
            Welcome back! 👨‍👩‍👧
          </h1>
          <p className="text-white/70 text-sm">
            Here's a summary of {child.name}'s progress.
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
                      {child.name}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-xs bg-secondary border-border/60 text-muted-foreground mt-1"
                    >
                      {child.year} · {child.subjects} Subjects
                    </Badge>
                  </div>
                </div>

                {/* Progress metrics */}
                <div className="flex-1 grid grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground font-medium">
                        Overall Grade
                      </span>
                      <span className="text-sm font-bold text-teacher">
                        {child.overallGrade}%
                      </span>
                    </div>
                    <Progress
                      value={child.overallGrade}
                      className="h-2 bg-teacher-light"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground font-medium">
                        Attendance
                      </span>
                      <span className="text-sm font-bold text-parent">
                        {child.attendance}%
                      </span>
                    </div>
                    <Progress
                      value={child.attendance}
                      className="h-2 bg-parent-light"
                    />
                  </div>
                </div>

                {/* Star badge */}
                <div className="flex items-center gap-2 bg-parent-light rounded-xl px-4 py-3 self-start sm:self-center">
                  <Star className="w-5 h-5 text-parent fill-parent" />
                  <div>
                    <p className="text-xs text-parent font-medium">
                      Performance
                    </p>
                    <p className="text-sm font-bold text-parent">Excellent</p>
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
            value={String(child.subjects)}
            color="text-teacher"
            bg="bg-teacher-light"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg. Grade"
            value={`${child.overallGrade}%`}
            color="text-parent"
            bg="bg-parent-light"
          />
          <StatCard
            icon={CheckCircle2}
            label="Attendance"
            value={`${child.attendance}%`}
            color="text-student"
            bg="bg-student-light"
          />
        </div>

        {/* Upcoming Sessions */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Upcoming Sessions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingSessions.map((s, i) => (
              <div
                key={s.id}
                data-ocid={`dashboard.sessions.item.${i + 1}`}
                className="card-lift bg-card rounded-xl border border-border/60 shadow-xs p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-parent-light flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-parent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {s.subject}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.teacher}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-foreground">
                    {s.date}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end mt-0.5">
                    <Clock className="w-3 h-3" />
                    {s.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Grades */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Recent Grades
          </h2>
          <div
            data-ocid="dashboard.grades.table"
            className="bg-card rounded-xl border border-border/60 shadow-xs overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-semibold text-foreground">
                    Subject
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Assignment
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-center">
                    Score
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-center hidden sm:table-cell">
                    Grade
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentGrades.map((g, i) => (
                  <TableRow
                    key={g.id}
                    data-ocid={`dashboard.grades.row.${i + 1}`}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="text-sm font-medium">
                      {g.subject}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {g.assignment}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {g.score}
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      <span
                        className={`text-sm ${gradeColors[g.grade] ?? "text-foreground"}`}
                      >
                        {g.grade}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
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
