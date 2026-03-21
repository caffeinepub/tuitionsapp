import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ban,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  LogOut,
  MessageSquare,
  Phone,
  ShieldCheck,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type Assignment,
  type CallBooking,
  type ChatMessage,
  type Grade,
  getAssignments,
  getCallBookings,
  getGrades,
} from "../utils/assignmentStorage";
import { type Review, deleteReview, getReviews } from "../utils/reviewStorage";
import {
  type StoredStudent,
  banStudent,
  getStudentUsers,
  unbanStudent,
} from "../utils/studentStorage";

function getAllChatMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem("tuitions_chat_messages");
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

type Props = {
  onLogout: () => void;
};

export function AdminDashboard({ onLogout }: Props) {
  const [students, setStudents] = useState<StoredStudent[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [bookings, setBookings] = useState<CallBooking[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const refresh = useCallback(() => {
    setStudents(getStudentUsers());
    setAssignments(getAssignments());
    setBookings(getCallBookings());
    setGrades(getGrades());
    setMessages(getAllChatMessages());
    setReviews(getReviews());
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [refresh]);

  const bannedCount = students.filter((s) => s.isBanned).length;

  const handleBan = (username: string) => {
    banStudent(username);
    refresh();
    toast.success(`Student "${username}" has been banned.`);
  };

  const handleUnban = (username: string) => {
    unbanStudent(username);
    refresh();
    toast.success(`Student "${username}" has been unbanned.`);
  };

  const handleDeleteReview = (id: string) => {
    deleteReview(id);
    refresh();
    toast.success("Review deleted.");
  };

  const stats = [
    {
      label: "Total Students",
      value: students.length,
      icon: Users,
      color: "text-student",
      bg: "bg-student-light",
    },
    {
      label: "Assignments",
      value: assignments.length,
      icon: BookOpen,
      color: "text-teacher",
      bg: "bg-teacher-light",
    },
    {
      label: "Bookings",
      value: bookings.length,
      icon: Phone,
      color: "text-parent",
      bg: "bg-parent-light",
    },
    {
      label: "Grades Given",
      value: grades.length,
      icon: Star,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Chat Messages",
      value: messages.length,
      icon: MessageSquare,
      color: "text-student",
      bg: "bg-student-light",
    },
    {
      label: "Banned Students",
      value: bannedCount,
      icon: Ban,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Reviews",
      value: reviews.length,
      icon: Star,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Admin Panel
            </h1>
            <p className="text-xs text-muted-foreground">
              TuitionsApp Control Centre
            </p>
          </div>
        </div>
        <Button
          data-ocid="admin.logout.button"
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="gap-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </header>

      <main className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-card border border-border/60 rounded-xl p-4 shadow-sm"
              >
                <div
                  className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}
                >
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger data-ocid="admin.overview.tab" value="overview">
              Overview
            </TabsTrigger>
            <TabsTrigger data-ocid="admin.students.tab" value="students">
              Students
              {students.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {students.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger data-ocid="admin.assignments.tab" value="assignments">
              Assignments
            </TabsTrigger>
            <TabsTrigger data-ocid="admin.bookings.tab" value="bookings">
              Bookings
            </TabsTrigger>
            <TabsTrigger data-ocid="admin.grades.tab" value="grades">
              Grades
            </TabsTrigger>
            <TabsTrigger data-ocid="admin.messages.tab" value="messages">
              Messages
            </TabsTrigger>
            <TabsTrigger data-ocid="admin.reviews.tab" value="reviews">
              Reviews
              {reviews.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {reviews.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="bg-card border border-border/60 rounded-xl p-6">
              <h2 className="font-display text-lg font-bold mb-4">
                Platform Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SummaryRow
                  icon={<Users className="w-4 h-4 text-student" />}
                  label="Registered Students"
                  value={students.length}
                />
                <SummaryRow
                  icon={<Ban className="w-4 h-4 text-destructive" />}
                  label="Banned Accounts"
                  value={bannedCount}
                />
                <SummaryRow
                  icon={<BookOpen className="w-4 h-4 text-teacher" />}
                  label="Total Assignments"
                  value={assignments.length}
                />
                <SummaryRow
                  icon={<Phone className="w-4 h-4 text-parent" />}
                  label="Call Bookings"
                  value={bookings.length}
                />
                <SummaryRow
                  icon={<Star className="w-4 h-4 text-primary" />}
                  label="Grades Recorded"
                  value={grades.length}
                />
                <SummaryRow
                  icon={<MessageSquare className="w-4 h-4 text-student" />}
                  label="Chat Messages"
                  value={messages.length}
                />
                <SummaryRow
                  icon={<CheckCircle2 className="w-4 h-4 text-teacher" />}
                  label="Completed Bookings"
                  value={
                    bookings.filter((b) => b.status === "completed").length
                  }
                />
                <SummaryRow
                  icon={<GraduationCap className="w-4 h-4 text-student" />}
                  label="Active Students"
                  value={students.filter((s) => !s.isBanned).length}
                />
                <SummaryRow
                  icon={<Star className="w-4 h-4 text-primary" />}
                  label="Parent Reviews"
                  value={reviews.length}
                />
              </div>
            </div>
          </TabsContent>

          {/* Students */}
          <TabsContent value="students">
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-display text-lg font-bold">All Students</h2>
                <p className="text-sm text-muted-foreground">
                  Manage student accounts — ban or unban with one click
                </p>
              </div>
              {students.length === 0 ? (
                <div
                  data-ocid="admin.students.empty_state"
                  className="flex flex-col items-center justify-center py-16 text-muted-foreground"
                >
                  <Users className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No students registered yet</p>
                </div>
              ) : (
                <Table data-ocid="admin.students.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s, i) => (
                      <TableRow
                        key={s.username}
                        data-ocid={`admin.students.row.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-xs">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          @{s.username}
                        </TableCell>
                        <TableCell>
                          {s.isBanned ? (
                            <Badge variant="destructive" className="text-xs">
                              Banned
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            >
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {s.isBanned ? (
                            <Button
                              data-ocid={`admin.students.secondary_button.${i + 1}`}
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() => handleUnban(s.username)}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Unban
                            </Button>
                          ) : (
                            <Button
                              data-ocid={`admin.students.delete_button.${i + 1}`}
                              size="sm"
                              variant="destructive"
                              className="h-7 text-xs gap-1"
                              onClick={() => handleBan(s.username)}
                            >
                              <Ban className="w-3.5 h-3.5" />
                              Ban
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Assignments */}
          <TabsContent value="assignments">
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-display text-lg font-bold">
                  All Assignments
                </h2>
                <p className="text-sm text-muted-foreground">
                  View all assignments created by teachers
                </p>
              </div>
              {assignments.length === 0 ? (
                <div
                  data-ocid="admin.assignments.empty_state"
                  className="flex flex-col items-center justify-center py-16 text-muted-foreground"
                >
                  <BookOpen className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No assignments created yet</p>
                </div>
              ) : (
                <Table data-ocid="admin.assignments.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((a, i) => (
                      <TableRow
                        key={a.id}
                        data-ocid={`admin.assignments.row.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-xs">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">{a.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {a.subject}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {a.teacherName}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {a.due}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Bookings */}
          <TabsContent value="bookings">
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-display text-lg font-bold">All Bookings</h2>
                <p className="text-sm text-muted-foreground">
                  All call sessions booked by students
                </p>
              </div>
              {bookings.length === 0 ? (
                <div
                  data-ocid="admin.bookings.empty_state"
                  className="flex flex-col items-center justify-center py-16 text-muted-foreground"
                >
                  <Phone className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No bookings yet</p>
                </div>
              ) : (
                <Table data-ocid="admin.bookings.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b, i) => (
                      <TableRow
                        key={b.id}
                        data-ocid={`admin.bookings.row.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-xs">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {b.studentName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {b.teacherName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {b.subject}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {b.callType}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {b.date}
                        </TableCell>
                        <TableCell>
                          {b.status === "completed" ? (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            >
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Grades */}
          <TabsContent value="grades">
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-display text-lg font-bold">All Grades</h2>
                <p className="text-sm text-muted-foreground">
                  Grades assigned by teachers after sessions
                </p>
              </div>
              {grades.length === 0 ? (
                <div
                  data-ocid="admin.grades.empty_state"
                  className="flex flex-col items-center justify-center py-16 text-muted-foreground"
                >
                  <Star className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No grades recorded yet</p>
                </div>
              ) : (
                <Table data-ocid="admin.grades.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((g, i) => (
                      <TableRow
                        key={g.id}
                        data-ocid={`admin.grades.row.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-xs">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {g.studentName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {g.teacherName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {g.subject}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-primary">
                            {g.grade}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                          {g.feedback || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages">
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-display text-lg font-bold">All Messages</h2>
                <p className="text-sm text-muted-foreground">
                  All chat messages between students and teachers
                </p>
              </div>
              {messages.length === 0 ? (
                <div
                  data-ocid="admin.messages.empty_state"
                  className="flex flex-col items-center justify-center py-16 text-muted-foreground"
                >
                  <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                <Table data-ocid="admin.messages.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Booking</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((m, i) => (
                      <TableRow
                        key={m.id}
                        data-ocid={`admin.messages.row.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-xs">
                          {i + 1}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">
                          {m.bookingId.slice(0, 8)}…
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              m.senderRole === "teacher"
                                ? "border-teacher text-teacher"
                                : "border-student text-student"
                            }`}
                          >
                            {m.senderRole}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {m.senderName}
                        </TableCell>
                        <TableCell className="text-sm max-w-[260px] truncate">
                          {m.text}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(m.sentAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews">
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-display text-lg font-bold">
                  Parent Reviews
                </h2>
                <p className="text-sm text-muted-foreground">
                  Reviews submitted by parents — delete any inappropriate review
                </p>
              </div>
              {reviews.length === 0 ? (
                <div
                  data-ocid="admin.reviews.empty_state"
                  className="flex flex-col items-center justify-center py-16 text-muted-foreground"
                >
                  <Star className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No reviews submitted yet</p>
                </div>
              ) : (
                <Table data-ocid="admin.reviews.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Parent Name</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((r, i) => (
                      <TableRow
                        key={r.id}
                        data-ocid={`admin.reviews.row.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-xs">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {r.parentName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.studentName || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="w-3.5 h-3.5"
                                fill={
                                  star <= r.rating ? "#f59e0b" : "transparent"
                                }
                                stroke={
                                  star <= r.rating ? "#f59e0b" : "#d1d5db"
                                }
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm max-w-[260px] truncate text-muted-foreground">
                          {r.reviewText}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            data-ocid={`admin.reviews.delete_button.${i + 1}`}
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleDeleteReview(r.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between bg-background rounded-xl px-4 py-3 border border-border/40">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}
