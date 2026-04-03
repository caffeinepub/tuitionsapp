import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Headphones,
  Send,
  ThumbsDown,
  ThumbsUp,
  Ticket,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type SupportChatMessage,
  type SupportTicket,
  getDirectChat,
  getSupportChat,
  getTicketsForSender,
  sendDirectMessage,
  sendSupportMessage,
  submitHelpyFeedback,
  submitTicket,
} from "../utils/supportStorage";

type Props = {
  senderRole: "teacher" | "parent";
  senderName: string;
  senderPrincipal: string;
  onClose: () => void;
};

type HelpyMessage = {
  id: string;
  from: "user" | "helpy";
  text: string;
  feedbackGiven?: boolean;
};

function getHelpyResponse(input: string): string {
  const q = input.toLowerCase();

  // Greetings
  if (
    q.includes("hello") ||
    q.includes("hi") ||
    q.includes("hey") ||
    q.includes("help") ||
    q.includes("what can you do")
  )
    return "Hello! I'm Helpy 😊 I can help with quizzes, classes, sessions, grades, reports, tickets, roll call, parent linking, announcements, warnings, profile setup, the leaderboard, AI tools, and more. What do you need help with today?";

  // Quiz & Test Builder
  if (q.includes("quiz") || q.includes("test") || q.includes("builder"))
    return "To create a quiz or test, go to your Teacher Dashboard and click 'Quiz & Test Builder'. Set a title, subject, and grade level, then add questions (multiple choice, short answer, true/false, or fill-in-the-blank). Configure settings like time limit, number of attempts, due date, shuffle, and pass mark. Then assign to individual students, a class, or all students. Students will see it in their 'My Quizzes' section.";

  // AI question generation
  if (
    (q.includes("ai") || q.includes("generate")) &&
    (q.includes("question") || q.includes("quiz"))
  )
    return "Teachers can use AI to generate quiz questions! In the Quiz & Test Builder, look for the 'Generate with AI' option. Enter a topic, choose the question type and quantity, then accept or dismiss each suggestion. This saves a lot of time when building assessments.";

  // Class management
  if (
    q.includes("class") &&
    (q.includes("create") ||
      q.includes("manage") ||
      q.includes("add student") ||
      q.includes("how"))
  )
    return "To create a class, go to 'My Classes' on the Teacher Dashboard, click 'Create Class', give it a name and subject. You can search for students and add them directly, or share the class code so students can self-join. Each class has its own chat and announcement board.";

  // Join class
  if (q.includes("join") && q.includes("class"))
    return "To join a class, ask your teacher for the class code. Then go to 'My Classes' on your Student Dashboard, enter the class code in the 'Join a Class' field, and click Join. You'll be added instantly.";

  // Class code
  if (q.includes("class code") || (q.includes("code") && q.includes("class")))
    return "Each class has a unique class code generated when the teacher creates it. Teachers can copy and share this code with students. Students enter it in the 'Join a Class' box on their dashboard. This is useful when a teacher can't find a student manually.";

  // Class chat
  if (q.includes("class chat") || (q.includes("chat") && q.includes("class")))
    return "Every class has a Class Chat — a shared message board for all class members including the teacher. Students and teachers can send messages there in real time. Find it by expanding your class card in the 'My Classes' section.";

  // Announcements
  if (q.includes("announcement"))
    return "Teachers can post announcements to any class from the class card in 'My Classes'. Click 'Post Announcement', type your message, and submit. Students enrolled in that class will see it displayed on their class card in the Student Dashboard.";

  // Roll call
  if (q.includes("roll call") || q.includes("attendance") || q.includes("roll"))
    return "Teachers can take roll call from a class card with enrolled students — click 'Take Roll'. The system automatically detects which students are online (green dot) and marks them as present. Teachers can override any entry before submitting. Submitted rolls are reviewed by the admin in the Roll Calls tab.";

  // Leaderboard
  if (q.includes("leaderboard") || q.includes("ranking") || q.includes("rank"))
    return "The leaderboard ranks students by their average grade across all sessions. Students can view it from their dashboard to see where they stand. It updates automatically as new grades are assigned. The current logged-in student is highlighted so they can see their own position at a glance.";

  // Grades
  if (
    q.includes("grade") ||
    q.includes("score") ||
    q.includes("marks") ||
    q.includes("result")
  )
    return "Grades are assigned by the teacher after a session or quiz. After a booking is completed, the teacher can enter a grade (e.g. A, B, 85%) which appears instantly in the Student Dashboard under 'My Grades'. Parents linked to that student can also see grades in real time from their Parent Dashboard.";

  // Booking / session
  if (q.includes("book") || q.includes("session") || q.includes("call"))
    return "To book a session, browse teachers on your Student Dashboard and click 'Book'. After booking, the teacher is notified. You'll see your booked sessions in your dashboard. Teachers can also accept or decline bookings and assign a grade after the session is complete.";

  // Parent linking
  if (
    q.includes("parent") &&
    (q.includes("link") ||
      q.includes("connect") ||
      q.includes("account") ||
      q.includes("verify"))
  )
    return "To link a parent: first, find your 6-digit verification code in the Student Dashboard (look for the 'Share with Parent' section). The parent logs in using Internet Identity, clicks 'Link Student Account', and enters your username and verification code. Once linked, the parent can see your grades, sessions, and bookings. The student must log in at least once after the latest update to sync their data.";

  // Parent switching students
  if ((q.includes("parent") || q.includes("switch")) && q.includes("student"))
    return "Parents can link multiple students and switch between them. In the Parent Dashboard header, there is a 'Switch Student' button that shows all linked students in a dropdown. Select the student you want to view and the dashboard updates to show their data. The button only appears when 2 or more students are linked.";

  // Chat with admin
  if (q.includes("chat") && q.includes("admin"))
    return "Switch to the 'Chat with Admin' tab in the Support Portal to send a direct private message to the admin. They typically respond within a short time. Your conversation is private — only you and the admin can see it.";

  // Ticket
  if (q.includes("ticket") || q.includes("support request"))
    return "To submit a support ticket, switch to the 'Leave a Ticket' tab. Fill in a subject and describe your issue, then click Submit. The admin will respond in the ticket chat and you'll see their reply here in the Support Portal.";

  // Report user
  if (q.includes("report") || q.includes("flag"))
    return "To report a user, click the flag icon (🚩 Report User) in your dashboard header. Select the user role (Student, Teacher, or Parent), enter their name, choose a reason, and submit. The admin will review it and can ban, warn, or delete the account.";

  // Warning / ban
  if (q.includes("warning") || q.includes("banned") || q.includes("ban"))
    return "If you received a warning, it will appear as an amber banner on your dashboard — this is issued by the admin. If you believe it was in error, use the 'Chat with Admin' tab to message directly. Banned accounts are logged out automatically. Warnings are visible to the affected user only, not to other students.";

  // Password / login
  if (
    q.includes("password") ||
    q.includes("forgot") ||
    q.includes("login") ||
    q.includes("sign in") ||
    q.includes("lost access")
  )
    return "Students log in with a username and password. If you forgot your password, click 'Forgot Password' on the login page. Teachers and Parents log in using Internet Identity — if you've lost access, use the 'Forgot/Lost Access' option on the login screen for recovery guidance.";

  // Profile setup / teacher profile
  if (
    q.includes("profile") ||
    q.includes("picture") ||
    q.includes("photo") ||
    q.includes("award") ||
    q.includes("experience")
  )
    return "Teachers can update their profile from the Teacher Dashboard — upload a profile picture, list teaching experience, and add awards. This information is visible to parents when they view teacher profiles from their dashboard. A complete, professional profile builds trust with parents and students.";

  // Free Time Robot
  if (
    (q.includes("free time robot") ||
      q.includes("robot") ||
      q.includes("ai assistant")) &&
    !q.includes("doubt")
  )
    return "Free Time Robot is the AI assistant for teachers. It can help craft messages for students or parents, write grade feedback, suggest lesson plans, give class management tips, and more. Find it via the purple sparkle button (bottom-right) on the Teacher Dashboard. Just type what you need — e.g. 'Write a message about the upcoming test' — and it will generate ready-to-use content.";

  // AI Doubt Bot
  if (
    q.includes("doubt bot") ||
    q.includes("ai doubt") ||
    (q.includes("ai") && q.includes("student") && q.includes("question"))
  )
    return "The AI Doubt Bot is available to students. Click the 'Ask AI' button (bottom-right of the Student Dashboard) to open it. You can ask questions about any school subject — Maths, Science, History, English, Computer Science, and more — and get clear, educational answers.";

  // Learning games
  if (
    q.includes("game") ||
    q.includes("learning game") ||
    q.includes("flashcard") ||
    q.includes("word scramble")
  )
    return "Students can access Learning Games from their dashboard. There are 8 subject categories (Core Academics, Technology, Arts, Languages, Life Skills, Environmental Science, Practical Subjects, Modern Enrichment) and 4 game modes: Flashcard Quiz, Word Scramble, Memory Match, and True/False. Games are topic-relevant and visually engaging. Select a category, pick a topic, and choose a game mode to start!";

  // My Quizzes
  if (
    q.includes("my quiz") ||
    q.includes("student quiz") ||
    q.includes("assigned quiz")
  )
    return "Students can find assigned quizzes in the 'My Quizzes' section of their Student Dashboard. Each quiz shows the subject, time limit, and due date. After completing a quiz, the result appears in the dashboard and the teacher can review per-student performance.";

  // Teacher-parent chat
  if (
    (q.includes("teacher") && q.includes("parent") && q.includes("chat")) ||
    q.includes("tp chat") ||
    q.includes("private chat")
  )
    return "Teachers and parents can chat privately with each other. Teachers access this via the 'Parent Messages' section on their dashboard. Parents use the 'Chat Teacher' button. These conversations are private to the two parties, but the admin can view all teacher-parent chats in the 'TP Chats' tab of the admin panel.";

  // Teacher age restriction
  if (
    q.includes("teacher") &&
    (q.includes("age") || q.includes("18") || q.includes("register"))
  )
    return "Teachers must be 18 or older to register on Tuition Skill. Date of birth is required at registration and verified during the first-time setup process. This is a platform requirement to ensure teacher suitability.";

  // Parent age restriction
  if (
    q.includes("parent") &&
    (q.includes("age") || q.includes("25") || q.includes("register"))
  )
    return "Parents must be 25 or older to create a parent account on Tuition Skill. Age is verified after logging in with Internet Identity. This helps ensure the platform is used appropriately for family connections.";

  // Reviews
  if (q.includes("review") || q.includes("rating") || q.includes("feedback"))
    return "Students aged 16 and over, and parents, can submit reviews from their dashboards. Reviews include a star rating and a comment. They appear publicly on the Tuition Skill home page under 'What Our Community Says'. Admin can manage or remove reviews from the admin panel.";

  // Internet Identity
  if (
    q.includes("internet identity") ||
    q.includes("ii login") ||
    q.includes("web3 login")
  )
    return "Internet Identity is a secure, password-free login system used by teachers and parents on Tuition Skill. It creates a unique, encrypted identity for each device. You don't need a password — it uses biometrics or a security key. If you lose access, use the Internet Identity recovery phrase you saved when you first set it up.";

  // Admin panel
  if (
    q.includes("admin") &&
    (q.includes("panel") || q.includes("access") || q.includes("how"))
  )
    return "The admin panel is hidden by default for security. To access it, click the Tuition Skill logo in the top-left of the home page 5 times quickly — the Admin button will appear. It requires the admin password. The admin can manage users, view roll calls, respond to support tickets, review Helpy feedback, and more.";

  // Helpy feedback
  if (
    q.includes("helpy") &&
    (q.includes("feedback") || q.includes("thumbs") || q.includes("rating"))
  )
    return "After each Helpy response, you'll see a thumbs up 👍 and thumbs down 👎 button. If you rate thumbs down, you can explain why. All feedback (both positive and negative) is sent to the admin so Helpy can be improved over time.";

  // Fallback
  return "I'm not sure about that one! For specific issues, try the 'Chat with Admin' tab or submit a ticket under 'Leave a Ticket'. The admin will be happy to help you directly 😊";
}

const QUICK_REPLIES = [
  "How do I create a quiz?",
  "How do I manage my class?",
  "How do I report a user?",
  "How do I submit a ticket?",
  "How do grades work?",
  "How do I join a class?",
  "How do I book a session?",
  "How do I link my parent account?",
  "What is Free Time Robot?",
  "How does roll call work?",
];

export function SupportPortal({
  senderRole,
  senderName,
  senderPrincipal,
  onClose,
}: Props) {
  // Direct chat state
  const [chatMessages, setChatMessages] = useState<SupportChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Ticket state
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [ticketChats, setTicketChats] = useState<
    Record<string, SupportChatMessage[]>
  >({});

  // Helpy state
  const [helpyMessages, setHelpyMessages] = useState<HelpyMessage[]>([]);
  const [helpyInput, setHelpyInput] = useState("");
  const [thumbsDownId, setThumbsDownId] = useState<string | null>(null);
  const [thumbsDownReason, setThumbsDownReason] = useState("");
  const helpyEndRef = useRef<HTMLDivElement>(null);
  const helpyScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function refresh() {
      setChatMessages(getDirectChat(senderPrincipal));
      setMyTickets(getTicketsForSender(senderPrincipal));
    }
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [senderPrincipal]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  useEffect(() => {
    helpyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  // Refresh ticket chat when expanded
  useEffect(() => {
    if (!expandedTicketId) return;
    setTicketChats((prev) => ({
      ...prev,
      [expandedTicketId]: getSupportChat(expandedTicketId),
    }));
    const id = setInterval(() => {
      if (expandedTicketId) {
        setTicketChats((prev) => ({
          ...prev,
          [expandedTicketId]: getSupportChat(expandedTicketId),
        }));
      }
    }, 2000);
    return () => clearInterval(id);
  }, [expandedTicketId]);

  function handleSendChat() {
    const text = chatInput.trim();
    if (!text) return;
    sendDirectMessage(senderPrincipal, senderRole, senderName, text);
    setChatInput("");
    setChatMessages(getDirectChat(senderPrincipal));
    setMyTickets(getTicketsForSender(senderPrincipal));
  }

  function handleSubmitTicket() {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast.error("Please fill in subject and message.");
      return;
    }
    submitTicket(
      senderRole,
      senderName,
      senderPrincipal,
      ticketSubject.trim(),
      ticketMessage.trim(),
    );
    setTicketSubject("");
    setTicketMessage("");
    toast.success("Ticket submitted! Admin will respond shortly.");
    setChatMessages(getDirectChat(senderPrincipal));
    setMyTickets(getTicketsForSender(senderPrincipal));
  }

  function handleHelpySend(text?: string) {
    const msg = (text ?? helpyInput).trim();
    if (!msg) return;
    const userMsg: HelpyMessage = {
      id: `${Date.now()}u`,
      from: "user",
      text: msg,
    };
    const botMsg: HelpyMessage = {
      id: `${Date.now()}h`,
      from: "helpy",
      text: getHelpyResponse(msg),
    };
    setHelpyMessages((prev) => [...prev, userMsg, botMsg]);
    setHelpyInput("");
  }

  // suppress unused import warning
  void sendSupportMessage;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-sm"
      data-ocid="support.modal"
    >
      <div className="w-full max-w-md bg-card border-l border-border flex flex-col shadow-2xl h-full animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-foreground text-sm">
                Support Portal
              </h2>
              <p className="text-xs text-muted-foreground">
                Chat with admin or leave a ticket
              </p>
            </div>
          </div>
          <Button
            data-ocid="support.close_button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Tabs
          defaultValue="chat"
          className="flex flex-col flex-1 overflow-hidden"
        >
          <TabsList className="mx-4 mt-3 mb-0 grid w-auto grid-cols-3">
            <TabsTrigger
              data-ocid="support.chat.tab"
              value="chat"
              className="gap-1.5 text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Chat with Admin
            </TabsTrigger>
            <TabsTrigger
              data-ocid="support.ticket.tab"
              value="ticket"
              className="gap-1.5 text-xs"
            >
              <Ticket className="w-3.5 h-3.5" />
              Leave a Ticket
            </TabsTrigger>
            <TabsTrigger
              data-ocid="support.helpy.tab"
              value="helpy"
              className="gap-1.5 text-xs"
            >
              <Bot className="w-3.5 h-3.5" />
              Ask Helpy
            </TabsTrigger>
          </TabsList>

          {/* Direct Chat Tab */}
          <TabsContent
            value="chat"
            className="flex-1 flex flex-col overflow-hidden m-0 p-0"
          >
            <ScrollArea className="flex-1 px-4 py-3">
              {chatMessages.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-32 text-center"
                  data-ocid="support.chat.empty_state"
                >
                  <Headphones className="w-8 h-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No messages yet.
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Send a message to start chatting with admin.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((msg) => {
                    const isAdmin = msg.senderRole === "admin";
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
                            isAdmin
                              ? "bg-muted text-foreground rounded-tl-sm"
                              : "bg-primary text-primary-foreground rounded-tr-sm"
                          }`}
                        >
                          {isAdmin && (
                            <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">
                              Admin
                            </p>
                          )}
                          <p
                            className="text-black leading-snug"
                            style={{ color: "#111" }}
                          >
                            {msg.text}
                          </p>
                          <p
                            className={`text-[10px] mt-1 ${isAdmin ? "text-muted-foreground" : "text-primary-foreground/70"}`}
                          >
                            {new Date(msg.sentAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
              )}
            </ScrollArea>
            <div className="px-4 py-3 border-t border-border bg-background/50">
              <div className="flex gap-2">
                <Input
                  data-ocid="support.chat.input"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSendChat()
                  }
                  placeholder="Type a message..."
                  className="flex-1 text-sm"
                />
                <Button
                  data-ocid="support.chat.submit_button"
                  size="sm"
                  onClick={handleSendChat}
                  disabled={!chatInput.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Ticket Tab */}
          <TabsContent
            value="ticket"
            className="flex-1 flex flex-col overflow-hidden m-0 p-0"
          >
            <ScrollArea className="flex-1 px-4 py-3">
              {/* Submit new ticket */}
              <div className="bg-muted/50 rounded-xl p-4 mb-4 border border-border/60">
                <h3 className="font-display font-bold text-sm mb-3 text-foreground">
                  Submit a New Ticket
                </h3>
                <div className="space-y-3">
                  <Input
                    data-ocid="support.ticket.subject.input"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Subject"
                    className="text-sm"
                  />
                  <Textarea
                    data-ocid="support.ticket.message.textarea"
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your issue or question..."
                    className="text-sm resize-none h-24"
                  />
                  <Button
                    data-ocid="support.ticket.submit_button"
                    size="sm"
                    onClick={handleSubmitTicket}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    Submit Ticket
                  </Button>
                </div>
              </div>

              {/* My existing tickets */}
              <h3 className="font-display font-bold text-sm mb-2 text-foreground">
                My Tickets
              </h3>
              {myTickets.length === 0 ? (
                <div
                  className="text-center py-8"
                  data-ocid="support.tickets.empty_state"
                >
                  <Ticket className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No tickets yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myTickets.map((ticket, i) => {
                    const isExpanded = expandedTicketId === ticket.id;
                    const msgs = ticketChats[ticket.id] ?? [];
                    return (
                      <div
                        key={ticket.id}
                        data-ocid={`support.tickets.item.${i + 1}`}
                        className="border border-border/60 rounded-xl overflow-hidden bg-card"
                      >
                        <div className="flex items-center justify-between p-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {ticket.subject}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-2 shrink-0">
                            <Badge
                              className={`text-[10px] px-1.5 py-0.5 ${
                                ticket.status === "open"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-gray-100 text-gray-500 border-gray-200"
                              }`}
                              variant="outline"
                            >
                              {ticket.status}
                            </Badge>
                            <Button
                              data-ocid={`support.tickets.view_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setExpandedTicketId(
                                  isExpanded ? null : ticket.id,
                                )
                              }
                              className="h-7 px-2 text-xs gap-1"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                              Chat
                            </Button>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="border-t border-border/60 bg-muted/30 p-3">
                            {msgs.length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-2">
                                No replies yet. Admin will respond here.
                              </p>
                            ) : (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {msgs.map((m) => {
                                  const fromAdmin = m.senderRole === "admin";
                                  return (
                                    <div
                                      key={m.id}
                                      className={`flex ${fromAdmin ? "justify-start" : "justify-end"}`}
                                    >
                                      <div
                                        className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-xs ${
                                          fromAdmin
                                            ? "bg-white border border-border/60"
                                            : "bg-primary text-primary-foreground"
                                        }`}
                                      >
                                        {fromAdmin && (
                                          <p className="text-[9px] font-bold text-muted-foreground mb-0.5">
                                            Admin
                                          </p>
                                        )}
                                        <p style={{ color: "#111" }}>
                                          {m.text}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Helpy Chatbot Tab — compact */}
          <TabsContent
            value="helpy"
            className="flex-1 flex flex-col overflow-hidden m-0 p-0"
          >
            {/* Helpy header — reduced */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-gradient-to-r from-violet-500/10 to-purple-500/5">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 border-2 border-violet-400/40 flex items-center justify-center text-sm shrink-0">
                🤖
              </div>
              <div>
                <p className="font-display font-bold text-xs text-foreground">
                  Helpy
                </p>
                <p className="text-xs text-muted-foreground">
                  Your support assistant
                </p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Online
                </span>
              </div>
            </div>

            {/* Helpy messages — native scrollbar always visible */}
            <div
              ref={helpyScrollRef}
              className="flex-1 px-3 py-2 overflow-y-scroll"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#7c3aed55 transparent",
              }}
            >
              {/* Welcome bubble (always shown) */}
              <div className="flex justify-start mb-2">
                <div className="flex items-start gap-1.5 max-w-[85%]">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    🤖
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-2.5 py-1.5">
                    <p className="text-[10px] font-semibold text-violet-600 mb-0.5">
                      Helpy
                    </p>
                    <p className="text-xs text-foreground leading-snug">
                      Hi! I&apos;m Helpy 👋 I&apos;m here to help you navigate
                      the platform. Ask me anything or pick a topic below!
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick reply chips — only when no messages yet */}
              {helpyMessages.length === 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3 pl-7">
                  {QUICK_REPLIES.map((qr) => (
                    <button
                      key={qr}
                      type="button"
                      data-ocid="support.helpy.button"
                      onClick={() => handleHelpySend(qr)}
                      className="text-[11px] px-2 py-1 rounded-full border border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors font-medium"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}

              {/* Conversation messages */}
              {helpyMessages.length > 0 && (
                <div className="space-y-2">
                  {helpyMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.from === "helpy" && (
                        <div className="flex items-start gap-1.5 max-w-[85%]">
                          <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs shrink-0 mt-0.5">
                            🤖
                          </div>
                          <div>
                            <div className="bg-muted rounded-2xl rounded-tl-sm px-2.5 py-1.5">
                              <p className="text-[10px] font-semibold text-violet-600 mb-0.5">
                                Helpy
                              </p>
                              <p className="text-xs text-foreground leading-snug">
                                {msg.text}
                              </p>
                            </div>
                            {!msg.feedbackGiven && (
                              <div className="flex items-center gap-1.5 mt-1 pl-1">
                                <button
                                  type="button"
                                  title="Helpful"
                                  onClick={() => {
                                    submitHelpyFeedback({
                                      messageId: msg.id,
                                      helpyReply: msg.text,
                                      rating: "up",
                                      senderRole,
                                      senderName,
                                    });
                                    setHelpyMessages((prev) =>
                                      prev.map((m) =>
                                        m.id === msg.id
                                          ? { ...m, feedbackGiven: true }
                                          : m,
                                      ),
                                    );
                                    setThumbsDownId(null);
                                  }}
                                  className="text-muted-foreground hover:text-green-600 transition-colors"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Not helpful"
                                  onClick={() => {
                                    setThumbsDownId(
                                      thumbsDownId === msg.id ? null : msg.id,
                                    );
                                    setThumbsDownReason("");
                                  }}
                                  className="text-muted-foreground hover:text-red-500 transition-colors"
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                            {msg.feedbackGiven && (
                              <p className="text-[10px] text-muted-foreground pl-1 mt-0.5">
                                Thanks for your feedback!
                              </p>
                            )}
                            {thumbsDownId === msg.id && !msg.feedbackGiven && (
                              <div className="mt-1.5 pl-1 flex flex-col gap-1">
                                <p className="text-[11px] text-muted-foreground">
                                  Why didn&apos;t you like this reply?
                                </p>
                                <textarea
                                  value={thumbsDownReason}
                                  onChange={(e) =>
                                    setThumbsDownReason(e.target.value)
                                  }
                                  placeholder="Tell us why..."
                                  className="text-xs border border-border rounded-lg px-2 py-1.5 resize-none h-16 bg-background w-full focus:outline-none focus:ring-1 focus:ring-violet-400"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!thumbsDownReason.trim()) return;
                                    submitHelpyFeedback({
                                      messageId: msg.id,
                                      helpyReply: msg.text,
                                      rating: "down",
                                      reason: thumbsDownReason.trim(),
                                      senderRole,
                                      senderName,
                                    });
                                    setHelpyMessages((prev) =>
                                      prev.map((m) =>
                                        m.id === msg.id
                                          ? { ...m, feedbackGiven: true }
                                          : m,
                                      ),
                                    );
                                    setThumbsDownId(null);
                                    setThumbsDownReason("");
                                  }}
                                  disabled={!thumbsDownReason.trim()}
                                  className="self-end text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg disabled:opacity-40 transition-colors"
                                >
                                  Submit
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {msg.from === "user" && (
                        <div className="max-w-[78%] rounded-2xl rounded-tr-sm px-2.5 py-1.5 bg-primary text-primary-foreground">
                          <p
                            className="text-xs leading-snug"
                            style={{ color: "#fff" }}
                          >
                            {msg.text}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={helpyEndRef} />
                </div>
              )}
            </div>

            {/* Helpy input — compact */}
            <div className="px-3 py-2 border-t border-border bg-background/50">
              <div className="flex gap-2">
                <Input
                  data-ocid="support.helpy.input"
                  value={helpyInput}
                  onChange={(e) => setHelpyInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleHelpySend()
                  }
                  placeholder="Ask Helpy anything..."
                  className="flex-1 text-xs"
                />
                <Button
                  data-ocid="support.helpy.submit_button"
                  size="sm"
                  onClick={() => handleHelpySend()}
                  disabled={!helpyInput.trim()}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-2.5"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
