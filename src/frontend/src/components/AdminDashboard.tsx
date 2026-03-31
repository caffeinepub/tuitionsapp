import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Ban,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Flag,
  GraduationCap,
  Headphones,
  LogOut,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  Star,
  ThumbsDown,
  ThumbsUp,
  Ticket,
  Trash2,
  Users,
} from "lucide-react";
import React from "react";
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
import {
  type ParentProfile,
  deleteParentProfile,
  getAllRegisteredParents,
} from "../utils/parentProfileStorage";
import { type Review, deleteReview, getReviews } from "../utils/reviewStorage";
import {
  type RollCall,
  getAllRollCallsForAdmin,
} from "../utils/rollCallStorage";
import {
  type StoredStudent,
  banStudent,
  flagStudentDob,
  getStudentUsers,
  unbanStudent,
} from "../utils/studentStorage";
import {
  type HelpyFeedback,
  type SupportReport,
  type SupportTicket,
  type TpChatMessage,
  banParent,
  banTeacher,
  clearTeacherWarnings,
  closeTicket,
  deleteParent,
  deleteReport,
  deleteTeacher,
  getAllDirectChats,
  getAllTpChats,
  getHelpyFeedback,
  getReports,
  getSupportChat,
  getTickets,
  getTpMessages,
  getWarningsForTeacher,
  isParentBanned,
  isTeacherBanned,
  markReportActioned,
  sendDirectMessage,
  sendSupportMessage,
  unbanParent,
  unbanTeacher,
  warnStudent,
  warnTeacher,
} from "../utils/supportStorage";

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
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [reports, setReports] = useState<SupportReport[]>([]);
  const [helpyFeedback, setHelpyFeedback] = useState<HelpyFeedback[]>([]);
  const [directChats, setDirectChats] = useState<
    { principal: string; lastMsg: string; senderName: string }[]
  >([]);
  const [expandedChatPrincipal, setExpandedChatPrincipal] = useState<
    string | null
  >(null);
  const [directChatMsgs, setDirectChatMsgs] = useState<
    Record<string, ReturnType<typeof getSupportChat>>
  >({});
  const [directChatInput, setDirectChatInput] = useState<
    Record<string, string>
  >({});
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [ticketChatMsgs, setTicketChatMsgs] = useState<
    Record<string, ReturnType<typeof getSupportChat>>
  >({});
  const [ticketChatInput, setTicketChatInput] = useState<
    Record<string, string>
  >({});
  const [warnInputTeacher, setWarnInputTeacher] = useState<
    Record<string, string>
  >({});
  const [warnOpenTeacher, setWarnOpenTeacher] = useState<
    Record<string, boolean>
  >({});
  const [warnInputReport, setWarnInputReport] = useState<
    Record<string, string>
  >({});
  const [warnOpenReport, setWarnOpenReport] = useState<Record<string, boolean>>(
    {},
  );

  const [tpChats, setTpChats] = useState<
    { channel: string; lastMsg: TpChatMessage }[]
  >([]);
  const [expandedTpChannel, setExpandedTpChannel] = useState<string | null>(
    null,
  );
  const [tpThreadMsgs, setTpThreadMsgs] = useState<
    Record<string, TpChatMessage[]>
  >({});

  const refresh = useCallback(() => {
    setStudents(getStudentUsers());
    setAssignments(getAssignments());
    setBookings(getCallBookings());
    setGrades(getGrades());
    setMessages(getAllChatMessages());
    setReviews(getReviews());
    setTickets(getTickets());
    setReports(getReports());
    setHelpyFeedback(getHelpyFeedback());
    setDirectChats(getAllDirectChats());
    setTpChats(getAllTpChats());
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [refresh]);

  // Refresh expanded direct chat messages
  useEffect(() => {
    if (!expandedChatPrincipal) return;
    function refreshChat() {
      if (expandedChatPrincipal) {
        setDirectChatMsgs((prev) => ({
          ...prev,
          [expandedChatPrincipal]: getSupportChat(expandedChatPrincipal),
        }));
      }
    }
    refreshChat();
    const id = setInterval(refreshChat, 2000);
    return () => clearInterval(id);
  }, [expandedChatPrincipal]);

  // Refresh expanded ticket chat
  useEffect(() => {
    if (!expandedTicketId) return;
    function refreshTicketChat() {
      if (expandedTicketId) {
        setTicketChatMsgs((prev) => ({
          ...prev,
          [expandedTicketId]: getSupportChat(expandedTicketId),
        }));
      }
    }
    refreshTicketChat();
    const id = setInterval(refreshTicketChat, 2000);
    return () => clearInterval(id);
  }, [expandedTicketId]);

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
    {
      label: "Support Tickets",
      value: tickets.length,
      icon: Ticket,
      color: "text-teacher",
      bg: "bg-teacher-light",
    },
    {
      label: "Reports",
      value: reports.length,
      icon: Flag,
      color: "text-destructive",
      bg: "bg-destructive/10",
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
              Tuition Skill Control Centre
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
            <TabsTrigger data-ocid="admin.teachers.tab" value="teachers">
              Teachers
            </TabsTrigger>
            <TabsTrigger data-ocid="admin.parents.tab" value="parents">
              Parents
            </TabsTrigger>
            <TabsTrigger data-ocid="admin.support.tab" value="support">
              <Headphones className="w-3.5 h-3.5 mr-1" />
              Support
              {tickets.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {tickets.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger data-ocid="admin.reports.tab" value="reports">
              <Flag className="w-3.5 h-3.5 mr-1" />
              Reports
              {reports.filter((r) => r.status === "pending").length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1.5 text-xs bg-orange-100 text-orange-700"
                >
                  {reports.filter((r) => r.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.tp_chats.tab"
              value="tp_chats"
              className="gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              TP Chats
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.roll_calls.tab"
              value="roll_calls"
              className="gap-1.5"
            >
              <ClipboardList className="w-4 h-4" />
              Roll Calls
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.helpy.tab"
              value="helpy"
              className="gap-1.5"
            >
              <Bot className="w-4 h-4" />
              Helpy Feedback
              {helpyFeedback.filter((f) => f.rating === "down").length > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0 h-4">
                  {helpyFeedback.filter((f) => f.rating === "down").length}
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
                      <TableHead>DOB</TableHead>
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
                          <span className="text-xs">
                            {s.dob ? s.dob : "Not set"}
                          </span>
                          {s.dobFlagged && (
                            <Badge className="ml-1 text-xs bg-amber-100 text-amber-700 border-amber-300">
                              Re-check pending
                            </Badge>
                          )}
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
                        <TableCell className="flex gap-1 flex-wrap items-center">
                          <Button
                            data-ocid={`admin.students.secondary_button.${i + 1}`}
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() => {
                              flagStudentDob(s.username);
                              setStudents(getStudentUsers());
                              toast.success(
                                `DOB re-check requested for @${s.username}`,
                              );
                            }}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Re-check DOB
                          </Button>
                          {s.isBanned ? (
                            <Button
                              data-ocid={`admin.students.toggle.${i + 1}`}
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

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-display text-lg font-bold">
                  Teacher Management
                </h2>
                <p className="text-sm text-muted-foreground">
                  Ban, warn, or remove teachers from the platform
                </p>
              </div>
              {(() => {
                const teacherNames = Array.from(
                  new Set(
                    assignments.map((a) => a.teacherName).filter(Boolean),
                  ),
                );
                if (teacherNames.length === 0) {
                  return (
                    <div
                      data-ocid="admin.teachers.empty_state"
                      className="flex flex-col items-center justify-center py-16 text-muted-foreground"
                    >
                      <Users className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-sm">No teachers found yet</p>
                    </div>
                  );
                }
                return (
                  <div className="divide-y divide-border">
                    {teacherNames.map((name, i) => {
                      const banned = isTeacherBanned(name);
                      const warnings = getWarningsForTeacher(name);
                      const warnOpen = warnOpenTeacher[name] ?? false;
                      return (
                        <div
                          key={name}
                          data-ocid={`admin.teachers.row.${i + 1}`}
                          className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">
                              {name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {banned ? (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Banned
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-green-600 border-green-300"
                                >
                                  Active
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {warnings.length} warning(s)
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {banned ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 border-green-300 text-green-700 hover:bg-green-50"
                                onClick={() => {
                                  unbanTeacher(name);
                                  refresh();
                                  toast.success(`Unbanned ${name}`);
                                }}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Unban
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 border-destructive text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  banTeacher(name);
                                  refresh();
                                  toast.success(`Banned ${name}`);
                                }}
                              >
                                <Ban className="w-3 h-3" />
                                Ban
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() =>
                                setWarnOpenTeacher((prev) => ({
                                  ...prev,
                                  [name]: !warnOpen,
                                }))
                              }
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Warn
                            </Button>
                            {warnings.length > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs gap-1"
                                onClick={() => {
                                  clearTeacherWarnings(name);
                                  refresh();
                                  toast.success("Warnings cleared");
                                }}
                              >
                                Clear Warns
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 text-xs gap-1"
                              onClick={() => {
                                deleteTeacher(name);
                                refresh();
                                toast.success(`Deleted ${name}`);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </Button>
                          </div>
                          {warnOpen && (
                            <div className="w-full mt-2 flex gap-2">
                              <Input
                                data-ocid={`admin.teachers.warn.input.${i + 1}`}
                                value={warnInputTeacher[name] ?? ""}
                                onChange={(e) =>
                                  setWarnInputTeacher((prev) => ({
                                    ...prev,
                                    [name]: e.target.value,
                                  }))
                                }
                                placeholder="Warning message..."
                                className="text-sm h-8"
                              />
                              <Button
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => {
                                  const msg = warnInputTeacher[name]?.trim();
                                  if (!msg) return;
                                  warnTeacher(name, msg);
                                  setWarnInputTeacher((prev) => ({
                                    ...prev,
                                    [name]: "",
                                  }));
                                  setWarnOpenTeacher((prev) => ({
                                    ...prev,
                                    [name]: false,
                                  }));
                                  refresh();
                                  toast.success(`Warning sent to ${name}`);
                                }}
                              >
                                Send
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </TabsContent>

          {/* Parents Tab */}
          <TabsContent value="parents">
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-display text-lg font-bold">
                  Parent Management
                </h2>
                <p className="text-sm text-muted-foreground">
                  All registered parents on Tuition Skill
                </p>
              </div>
              <ParentsRegistryList refresh={refresh} />
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <div className="space-y-6">
              {/* Direct Chats */}
              <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="font-display text-lg font-bold flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-primary" />
                    Direct Chats
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Private chats from teachers and parents
                  </p>
                </div>
                {directChats.length === 0 ? (
                  <div
                    data-ocid="admin.support.chats.empty_state"
                    className="flex flex-col items-center justify-center py-12 text-muted-foreground"
                  >
                    <Headphones className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">No direct chats yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {directChats.map((chat, i) => {
                      const isExpanded =
                        expandedChatPrincipal === chat.principal;
                      const msgs = directChatMsgs[chat.principal] ?? [];
                      return (
                        <div
                          key={chat.principal}
                          data-ocid={`admin.support.chat.item.${i + 1}`}
                        >
                          <button
                            type="button"
                            className="w-full px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 text-left"
                            onClick={() =>
                              setExpandedChatPrincipal(
                                isExpanded ? null : chat.principal,
                              )
                            }
                          >
                            <div>
                              <p className="font-semibold text-sm">
                                {chat.senderName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-xs">
                                {chat.lastMsg}
                              </p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="border-t border-border bg-muted/20 px-6 py-4">
                              <ScrollArea className="h-48 mb-3">
                                {msgs.length === 0 ? (
                                  <p className="text-xs text-muted-foreground text-center py-4">
                                    No messages yet
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {msgs.map((m) => (
                                      <div
                                        key={m.id}
                                        className={`flex ${m.senderRole === "admin" ? "justify-end" : "justify-start"}`}
                                      >
                                        <div
                                          className={`max-w-[80%] rounded-xl px-3 py-1.5 text-sm ${m.senderRole === "admin" ? "bg-primary text-primary-foreground" : "bg-white border border-border"}`}
                                        >
                                          {m.senderRole !== "admin" && (
                                            <p className="text-[10px] font-bold text-muted-foreground mb-0.5">
                                              {m.senderName}
                                            </p>
                                          )}
                                          <p style={{ color: "#111" }}>
                                            {m.text}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </ScrollArea>
                              <div className="flex gap-2">
                                <Input
                                  data-ocid={`admin.support.chat.input.${i + 1}`}
                                  value={directChatInput[chat.principal] ?? ""}
                                  onChange={(e) =>
                                    setDirectChatInput((prev) => ({
                                      ...prev,
                                      [chat.principal]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      const text =
                                        directChatInput[chat.principal]?.trim();
                                      if (text) {
                                        sendDirectMessage(
                                          chat.principal,
                                          "admin",
                                          "Admin",
                                          text,
                                        );
                                        setDirectChatInput((prev) => ({
                                          ...prev,
                                          [chat.principal]: "",
                                        }));
                                        setDirectChatMsgs((prev) => ({
                                          ...prev,
                                          [chat.principal]: getSupportChat(
                                            chat.principal,
                                          ),
                                        }));
                                      }
                                    }
                                  }}
                                  placeholder="Reply to this user..."
                                  className="text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const text =
                                      directChatInput[chat.principal]?.trim();
                                    if (!text) return;
                                    sendDirectMessage(
                                      chat.principal,
                                      "admin",
                                      "Admin",
                                      text,
                                    );
                                    setDirectChatInput((prev) => ({
                                      ...prev,
                                      [chat.principal]: "",
                                    }));
                                    setDirectChatMsgs((prev) => ({
                                      ...prev,
                                      [chat.principal]: getSupportChat(
                                        chat.principal,
                                      ),
                                    }));
                                  }}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tickets */}
              <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="font-display text-lg font-bold flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-primary" />
                    Support Tickets
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Tickets submitted by teachers and parents
                  </p>
                </div>
                {tickets.length === 0 ? (
                  <div
                    data-ocid="admin.support.tickets.empty_state"
                    className="flex flex-col items-center justify-center py-12 text-muted-foreground"
                  >
                    <Ticket className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">No tickets yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {tickets.map((ticket, i) => {
                      const isExpanded = expandedTicketId === ticket.id;
                      const msgs = ticketChatMsgs[ticket.id] ?? [];
                      return (
                        <div
                          key={ticket.id}
                          data-ocid={`admin.support.ticket.item.${i + 1}`}
                        >
                          <div className="px-6 py-3 flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">
                                {ticket.subject}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                  {ticket.senderName}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] px-1.5 ${ticket.status === "open" ? "text-green-600 border-green-300" : "text-gray-500"}`}
                                >
                                  {ticket.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {ticket.status === "open" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs"
                                  onClick={() => {
                                    closeTicket(ticket.id);
                                    refresh();
                                    toast.success("Ticket closed");
                                  }}
                                >
                                  Close
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() =>
                                  setExpandedTicketId(
                                    isExpanded ? null : ticket.id,
                                  )
                                }
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="border-t border-border bg-muted/20 px-6 py-4">
                              <p className="text-sm text-muted-foreground mb-3 italic">
                                "{ticket.message}"
                              </p>
                              <ScrollArea className="h-40 mb-3">
                                {msgs.length === 0 ? (
                                  <p className="text-xs text-muted-foreground text-center py-4">
                                    No replies yet
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {msgs.map((m) => (
                                      <div
                                        key={m.id}
                                        className={`flex ${m.senderRole === "admin" ? "justify-end" : "justify-start"}`}
                                      >
                                        <div
                                          className={`max-w-[80%] rounded-xl px-3 py-1.5 text-sm ${m.senderRole === "admin" ? "bg-primary text-primary-foreground" : "bg-white border border-border"}`}
                                        >
                                          {m.senderRole !== "admin" && (
                                            <p className="text-[10px] font-bold text-muted-foreground mb-0.5">
                                              {m.senderName}
                                            </p>
                                          )}
                                          <p style={{ color: "#111" }}>
                                            {m.text}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </ScrollArea>
                              <div className="flex gap-2">
                                <Input
                                  data-ocid={`admin.support.ticket.input.${i + 1}`}
                                  value={ticketChatInput[ticket.id] ?? ""}
                                  onChange={(e) =>
                                    setTicketChatInput((prev) => ({
                                      ...prev,
                                      [ticket.id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      const text =
                                        ticketChatInput[ticket.id]?.trim();
                                      if (text) {
                                        sendSupportMessage(
                                          ticket.id,
                                          "admin",
                                          "Admin",
                                          text,
                                        );
                                        setTicketChatInput((prev) => ({
                                          ...prev,
                                          [ticket.id]: "",
                                        }));
                                        setTicketChatMsgs((prev) => ({
                                          ...prev,
                                          [ticket.id]: getSupportChat(
                                            ticket.id,
                                          ),
                                        }));
                                      }
                                    }
                                  }}
                                  placeholder="Reply to ticket..."
                                  className="text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const text =
                                      ticketChatInput[ticket.id]?.trim();
                                    if (!text) return;
                                    sendSupportMessage(
                                      ticket.id,
                                      "admin",
                                      "Admin",
                                      text,
                                    );
                                    setTicketChatInput((prev) => ({
                                      ...prev,
                                      [ticket.id]: "",
                                    }));
                                    setTicketChatMsgs((prev) => ({
                                      ...prev,
                                      [ticket.id]: getSupportChat(ticket.id),
                                    }));
                                  }}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  <Flag className="w-5 h-5 text-orange-500" />
                  User Reports
                </h2>
                <p className="text-sm text-muted-foreground">
                  Reports submitted by students, teachers, and parents
                </p>
              </div>
              {reports.length === 0 ? (
                <div
                  data-ocid="admin.reports.empty_state"
                  className="flex flex-col items-center justify-center py-16 text-muted-foreground"
                >
                  <Flag className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No reports yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {reports.map((report, i) => {
                    const warnOpen = warnOpenReport[report.id] ?? false;
                    return (
                      <div
                        key={report.id}
                        data-ocid={`admin.reports.item.${i + 1}`}
                        className="px-6 py-4"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {report.reporterRole}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                reported a
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize border-orange-300 text-orange-700"
                              >
                                {report.reportedUserType}
                              </Badge>
                            </div>
                            <p className="font-semibold text-sm text-foreground">
                              {report.reportedUserName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Reported by: {report.reporterName}
                            </p>
                            <p className="text-sm text-foreground mt-1.5 bg-muted/40 rounded-lg px-3 py-1.5">
                              {report.reason}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            className={`text-xs shrink-0 ${report.status === "pending" ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-green-100 text-green-700 border-green-200"}`}
                            variant="outline"
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {report.reportedUserType === "student" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 border-destructive text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  banStudent(report.reportedUserName);
                                  markReportActioned(report.id);
                                  refresh();
                                  toast.success(
                                    `Banned student ${report.reportedUserName}`,
                                  );
                                }}
                              >
                                <Ban className="w-3 h-3" />
                                Ban
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                onClick={() =>
                                  setWarnOpenReport((prev) => ({
                                    ...prev,
                                    [report.id]: !warnOpen,
                                  }))
                                }
                              >
                                <AlertTriangle className="w-3 h-3" />
                                Warn
                              </Button>
                            </>
                          )}
                          {report.reportedUserType === "teacher" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 border-destructive text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  banTeacher(report.reportedUserName);
                                  markReportActioned(report.id);
                                  refresh();
                                  toast.success(
                                    `Banned teacher ${report.reportedUserName}`,
                                  );
                                }}
                              >
                                <Ban className="w-3 h-3" />
                                Ban
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                onClick={() =>
                                  setWarnOpenReport((prev) => ({
                                    ...prev,
                                    [report.id]: !warnOpen,
                                  }))
                                }
                              >
                                <AlertTriangle className="w-3 h-3" />
                                Warn
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-xs gap-1"
                                onClick={() => {
                                  deleteTeacher(report.reportedUserName);
                                  markReportActioned(report.id);
                                  refresh();
                                  toast.success(
                                    `Deleted teacher ${report.reportedUserName}`,
                                  );
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </Button>
                            </>
                          )}
                          {report.reportedUserType === "parent" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 border-destructive text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  banParent(report.reportedUserName);
                                  markReportActioned(report.id);
                                  refresh();
                                  toast.success("Banned");
                                }}
                              >
                                <Ban className="w-3 h-3" />
                                Ban
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-xs gap-1"
                                onClick={() => {
                                  deleteParent(report.reportedUserName);
                                  markReportActioned(report.id);
                                  refresh();
                                  toast.success("Deleted");
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </Button>
                            </>
                          )}
                          {report.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1 border-green-300 text-green-700 hover:bg-green-50"
                              onClick={() => {
                                markReportActioned(report.id);
                                refresh();
                                toast.success("Marked as actioned");
                              }}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Mark Actioned
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs gap-1 text-muted-foreground"
                            onClick={() => {
                              deleteReport(report.id);
                              refresh();
                              toast.success("Report dismissed");
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                            Dismiss
                          </Button>
                        </div>
                        {warnOpen && (
                          <div className="mt-2 flex gap-2">
                            <Input
                              data-ocid={`admin.reports.warn.input.${i + 1}`}
                              value={warnInputReport[report.id] ?? ""}
                              onChange={(e) =>
                                setWarnInputReport((prev) => ({
                                  ...prev,
                                  [report.id]: e.target.value,
                                }))
                              }
                              placeholder="Warning message..."
                              className="text-sm h-8"
                            />
                            <Button
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => {
                                const msg = warnInputReport[report.id]?.trim();
                                if (!msg) return;
                                if (report.reportedUserType === "student") {
                                  warnStudent(report.reportedUserName, msg);
                                } else if (
                                  report.reportedUserType === "teacher"
                                ) {
                                  warnTeacher(report.reportedUserName, msg);
                                }
                                markReportActioned(report.id);
                                setWarnInputReport((prev) => ({
                                  ...prev,
                                  [report.id]: "",
                                }));
                                setWarnOpenReport((prev) => ({
                                  ...prev,
                                  [report.id]: false,
                                }));
                                refresh();
                                toast.success("Warning sent");
                              }}
                            >
                              Send
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="tp_chats">
            <div className="bg-card rounded-2xl border border-border/60 p-6">
              <h3 className="font-display font-bold text-lg mb-1">
                Teacher-Parent Chats
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Private messages between teachers and parents. Read-only view
                for admin.
              </p>
              {tpChats.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No teacher-parent chats yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tpChats.map(({ channel, lastMsg }, i) => {
                    const parts = channel.replace("tp:", "").split(":");
                    const teacherName = parts[0] ?? "Unknown Teacher";
                    const parentId =
                      parts.slice(1).join(":") ?? "Unknown Parent";
                    const isExpanded = expandedTpChannel === channel;
                    return (
                      <div
                        key={channel}
                        data-ocid={`admin.tp_chats.item.${i + 1}`}
                        className="border border-border/60 rounded-xl overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-4 py-3 bg-background">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              Teacher:{" "}
                              <span className="text-teacher font-semibold">
                                {teacherName}
                              </span>{" "}
                              ↔ Parent of student:{" "}
                              <span className="text-parent font-semibold">
                                {parentId}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              "{lastMsg.text}" — {lastMsg.senderName} ·{" "}
                              {new Date(lastMsg.sentAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant={isExpanded ? "default" : "outline"}
                            className="ml-3 flex-shrink-0 text-xs"
                            onClick={() => {
                              if (isExpanded) {
                                setExpandedTpChannel(null);
                              } else {
                                setExpandedTpChannel(channel);
                                setTpThreadMsgs((prev) => ({
                                  ...prev,
                                  [channel]: getTpMessages(channel),
                                }));
                              }
                            }}
                          >
                            {isExpanded ? "Hide" : "View"}
                          </Button>
                        </div>
                        {isExpanded && (
                          <div className="border-t border-border/40 p-4 bg-muted/20 max-h-72 overflow-y-auto space-y-2">
                            {(tpThreadMsgs[channel] ?? []).length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-4">
                                No messages in this thread.
                              </p>
                            ) : (
                              (tpThreadMsgs[channel] ?? []).map((msg) => (
                                <div
                                  key={msg.id}
                                  className={`flex ${msg.senderRole === "teacher" ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={`max-w-[75%] px-3 py-1.5 rounded-xl text-xs ${msg.senderRole === "teacher" ? "bg-teacher/10 text-teacher border border-teacher/20 rounded-br-sm" : "bg-parent/10 text-parent border border-parent/20 rounded-bl-sm"}`}
                                  >
                                    <p className="font-semibold mb-0.5">
                                      {msg.senderName}{" "}
                                      <span className="font-normal opacity-60 capitalize">
                                        ({msg.senderRole})
                                      </span>
                                    </p>
                                    <p className="text-foreground">
                                      {msg.text}
                                    </p>
                                    <p className="text-[10px] mt-0.5 opacity-60">
                                      {new Date(msg.sentAt).toLocaleTimeString(
                                        [],
                                        { hour: "2-digit", minute: "2-digit" },
                                      )}{" "}
                                      ·{" "}
                                      {new Date(
                                        msg.sentAt,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="helpy">
            <div className="bg-card rounded-2xl border border-border/60 p-6">
              <h3 className="font-display font-bold text-lg mb-1">
                Helpy Feedback
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Thumbs up and thumbs down ratings from teachers and parents on
                Helpy replies.
              </p>
              {helpyFeedback.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No Helpy feedback yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...helpyFeedback].reverse().map((fb, i) => (
                    <div
                      key={fb.id}
                      data-ocid={`admin.helpy.feedback.${i + 1}`}
                      className="border border-border/60 rounded-xl p-4 bg-background"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">
                            <span className="font-semibold text-foreground capitalize">
                              {fb.senderRole}
                            </span>
                            : {fb.senderName} ·{" "}
                            {new Date(fb.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground italic line-clamp-2 mb-2">
                            &ldquo;{fb.helpyReply}&rdquo;
                          </p>
                          {fb.rating === "down" && fb.reason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-1">
                              <p className="text-xs font-semibold text-red-600 mb-0.5">
                                Reason:
                              </p>
                              <p className="text-xs text-red-700">
                                {fb.reason}
                              </p>
                            </div>
                          )}
                        </div>
                        <div
                          className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${fb.rating === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                        >
                          {fb.rating === "up" ? (
                            <ThumbsUp className="w-3.5 h-3.5" />
                          ) : (
                            <ThumbsDown className="w-3.5 h-3.5" />
                          )}
                          {fb.rating === "up" ? "Helpful" : "Not helpful"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          {/* Roll Calls Tab */}
          <TabsContent value="roll_calls">
            <RollCallsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ParentsRegistryList({ refresh }: { refresh: () => void }) {
  const [parents, setParents] = React.useState<ParentProfile[]>(() =>
    getAllRegisteredParents(),
  );
  React.useEffect(() => {
    const id = setInterval(() => setParents(getAllRegisteredParents()), 3000);
    return () => clearInterval(id);
  }, []);
  if (parents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Users className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm">No parents registered yet</p>
      </div>
    );
  }
  return (
    <div className="divide-y divide-border">
      {parents.map((parent, i) => {
        const banned = isParentBanned(parent.principal);
        return (
          <div
            key={parent.principal}
            data-ocid={`admin.parents.row.${i + 1}`}
            className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="flex-1">
              <p className="font-semibold text-foreground">{parent.name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {parent.principal.slice(0, 28)}…
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Joined: {new Date(parent.joinedAt).toLocaleDateString()}
                {parent.linkedStudents.length > 0 && (
                  <> · Linked students: {parent.linkedStudents.join(", ")}</>
                )}
              </p>
              <div className="mt-1">
                {banned ? (
                  <Badge variant="destructive" className="text-xs">
                    Banned
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-xs text-green-600 border-green-300"
                  >
                    Active
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {banned ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => {
                    unbanParent(parent.principal);
                    refresh();
                    toast.success("Unbanned");
                  }}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Unban
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    banParent(parent.principal);
                    refresh();
                    toast.success("Banned");
                  }}
                >
                  <Ban className="w-3 h-3" />
                  Ban
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs gap-1"
                onClick={() => {
                  deleteParent(parent.principal);
                  deleteParentProfile(parent.principal);
                  refresh();
                  toast.success("Deleted");
                }}
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RollCallsTab() {
  const [rolls, setRolls] = React.useState<RollCall[]>(() =>
    getAllRollCallsForAdmin(),
  );
  const [expanded, setExpanded] = React.useState<string | null>(null);
  React.useEffect(() => {
    const id = setInterval(() => setRolls(getAllRollCallsForAdmin()), 5000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-display text-lg font-bold">Roll Calls</h2>
        <p className="text-sm text-muted-foreground">
          Attendance submitted by teachers
        </p>
      </div>
      {rolls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ClipboardList className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No roll calls submitted yet</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {rolls.map((roll) => {
            const presentCount = roll.entries.filter((e) => e.present).length;
            const absentCount = roll.entries.filter((e) => !e.present).length;
            const isExpanded = expanded === roll.id;
            return (
              <div key={roll.id} className="px-6 py-4">
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => setExpanded(isExpanded ? null : roll.id)}
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {roll.className}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Teacher: {roll.teacherName} · Date: {roll.date} ·{" "}
                      {new Date(roll.submittedAt).toLocaleTimeString()}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                        ✓ {presentCount} present
                      </span>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                        ✗ {absentCount} absent
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>
                {isExpanded && (
                  <div className="mt-3 space-y-1.5">
                    {roll.entries.map((e) => (
                      <div
                        key={e.username}
                        className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2"
                      >
                        <span className="text-sm font-medium">
                          @{e.username}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.present ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {e.present ? "Present" : "Absent"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
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
