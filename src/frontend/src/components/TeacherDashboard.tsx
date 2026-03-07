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
  BookOpen,
  Calendar,
  ClipboardList,
  Clock,
  Plus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardNav } from "./DashboardNav";

type Props = {
  onLogout: () => void;
};

const classes = [
  {
    id: 1,
    name: "Advanced Mathematics",
    students: 18,
    next: "Mon, 10 Mar · 4:00 PM",
    level: "A-Level",
  },
  {
    id: 2,
    name: "Physics",
    students: 14,
    next: "Tue, 11 Mar · 3:30 PM",
    level: "GCSE",
  },
  {
    id: 3,
    name: "Further Mathematics",
    students: 9,
    next: "Wed, 12 Mar · 5:00 PM",
    level: "A-Level",
  },
];

const initialAssignments = [
  {
    id: 1,
    title: "Quadratic Equations Practice Set",
    subject: "Mathematics",
    due: "10 Mar 2026",
    submissions: 12,
  },
  {
    id: 2,
    title: "Newton's Laws Lab Report",
    subject: "Physics",
    due: "12 Mar 2026",
    submissions: 8,
  },
  {
    id: 3,
    title: "Integration Techniques Worksheet",
    subject: "Further Mathematics",
    due: "15 Mar 2026",
    submissions: 5,
  },
  {
    id: 4,
    title: "Wave Motion Analysis",
    subject: "Physics",
    due: "18 Mar 2026",
    submissions: 3,
  },
];

export function TeacherDashboard({ onLogout }: Props) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [createOpen, setCreateOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newDue, setNewDue] = useState("");

  const totalStudents = classes.reduce((sum, c) => sum + c.students, 0);

  const handleCreateAssignment = () => {
    if (!newTitle.trim() || !newSubject.trim() || !newDue.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    const newItem = {
      id: assignments.length + 1,
      title: newTitle.trim(),
      subject: newSubject.trim(),
      due: newDue.trim(),
      submissions: 0,
    };
    setAssignments((prev) => [newItem, ...prev]);
    setNewTitle("");
    setNewSubject("");
    setNewDue("");
    setCreateOpen(false);
    toast.success("Assignment created successfully!");
  };

  const handleCreateSession = () => {
    setSessionOpen(false);
    toast.success("Session scheduled!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNav
        userRole="Teacher"
        onLogout={onLogout}
        headerClass="dashboard-header-teacher"
      />

      {/* Welcome banner */}
      <div className="dashboard-header-teacher px-4 sm:px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Good day, Teacher! 📚
          </h1>
          <p className="text-white/70 text-sm">
            You have {classes.length} active classes this week.
          </p>
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full -mt-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={BookOpen}
            label="Active Classes"
            value={String(classes.length)}
            color="text-teacher"
            bg="bg-teacher-light"
          />
          <StatCard
            icon={Users}
            label="Total Students"
            value={String(totalStudents)}
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

        {/* My Classes */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            My Classes
          </h2>
          <div
            data-ocid="dashboard.subjects.list"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {classes.map((c, i) => (
              <div
                key={c.id}
                data-ocid={`dashboard.subjects.item.${i + 1}`}
                className="card-lift bg-card rounded-xl border border-border/60 shadow-xs p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-teacher-light flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-teacher" />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs bg-secondary border-border/60 text-muted-foreground"
                  >
                    {c.level}
                  </Badge>
                </div>
                <p className="font-semibold text-sm text-foreground mb-1">
                  {c.name}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <Users className="w-3 h-3" />
                  {c.students} students
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {c.next}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Assignments */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Assignments
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
                  <div className="w-7 h-7 rounded-lg bg-teacher-light flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-3.5 h-3.5 text-teacher" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {a.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{a.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-right">
                  <div className="hidden sm:block">
                    <p className="text-xs text-muted-foreground">Due {a.due}</p>
                    <p className="text-xs text-teacher font-medium">
                      {a.submissions} submitted
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground sm:hidden">
                    <Clock className="w-3 h-3" />
                    {a.due}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
      <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
        <DialogContent
          data-ocid="teacher.session.dialog"
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Schedule a Session
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Session scheduling is coming soon. Your classes will be notified
            automatically.
          </p>
          <DialogFooter>
            <Button
              data-ocid="teacher.session.close_button"
              onClick={handleCreateSession}
              className="bg-teacher hover:bg-teacher/90 text-white"
            >
              Got it
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
