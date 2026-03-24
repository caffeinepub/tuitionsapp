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
  submitTicket,
} from "../utils/supportStorage";

type Props = {
  senderRole: "teacher" | "parent";
  senderName: string;
  senderPrincipal: string;
  onClose: () => void;
};

type HelpyMessage = { id: string; from: "user" | "helpy"; text: string };

function getHelpyResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("quiz") || q.includes("test") || q.includes("builder")) {
    return "To create a quiz or test, go to your Teacher Dashboard and click the 'Quiz & Test Builder' section. You can set a title, subject, grade level, add questions (multiple choice, short answer, true/false), configure settings like time limit and due date, then assign it to students. Students will see it in their 'My Quizzes' section.";
  }
  if (
    q.includes("class") &&
    (q.includes("create") || q.includes("manage") || q.includes("add student"))
  ) {
    return "To create a class, go to the 'My Classes' section in your Teacher Dashboard, click 'Create Class', give it a name and subject. You can search for students and add them directly. Each class gets a unique class code — share it with students so they can join by entering the code in their dashboard.";
  }
  if (q.includes("join") && q.includes("class")) {
    return "To join a class, ask your teacher for the class code. Then go to 'My Classes' on your Student Dashboard, enter the class code in the 'Join a Class' field and click Join. You'll instantly be added to the class.";
  }
  if (q.includes("report") || q.includes("flag")) {
    return "To report a user, click the flag icon (🚩 Report User) in your dashboard header. Select the user role (Student, Teacher, or Parent), enter their name, choose a reason, and submit. The admin will review it and can ban, warn, or delete the account.";
  }
  if (q.includes("ticket")) {
    return "To submit a support ticket, switch to the 'Leave a Ticket' tab in this Support Portal. Fill in a subject and describe your issue, then click Submit. The admin will respond in the ticket chat and you'll see their reply here.";
  }
  if (q.includes("grade") || q.includes("score") || q.includes("marks")) {
    return "Grades are assigned by your teacher after a session or quiz. After a booking is completed, the teacher can enter a grade (e.g. A, B, 85%) which instantly appears in your Student Dashboard under 'My Grades'. Parents linked to the student account can also see grades in real time.";
  }
  if (q.includes("book") || q.includes("session") || q.includes("call")) {
    return "To book a session, browse teachers on your Student Dashboard, view their assignments, and click 'Book'. You can choose between a chat session or a call (when available). After booking, the teacher is notified and will initiate the session. You'll see your booked sessions in your dashboard.";
  }
  if (
    q.includes("parent") &&
    (q.includes("link") || q.includes("connect") || q.includes("account"))
  ) {
    return "To link a parent account, first note your 6-digit verification code from your Student Dashboard (look for the 'Share with Parent' section). Then the parent logs in using Internet Identity, clicks 'Link Student Account', and enters your username and 6-digit code. Once verified, they'll see your grades and sessions.";
  }
  if (q.includes("chat") && q.includes("admin")) {
    return "Switch to the 'Chat with Admin' tab to send a direct private message to the admin. They typically respond within a short time. Your conversation is private and only visible to you and the admin.";
  }
  if (q.includes("announcement")) {
    return "Teachers can post announcements to a class from the class card in 'My Classes'. Students enrolled in that class will see the announcement displayed on their class card in the Student Dashboard.";
  }
  if (q.includes("warning") || q.includes("banned") || q.includes("ban")) {
    return "If you received a warning, it will appear as an amber banner on your dashboard. This is issued by the admin. If you believe it was in error, use the 'Chat with Admin' tab to message the admin directly. Banned accounts are logged out automatically.";
  }
  if (
    q.includes("password") ||
    q.includes("forgot") ||
    q.includes("login") ||
    q.includes("sign in")
  ) {
    return "Students log in with a username and password. If you forgot your password, click 'Forgot Password' on the login page. Teachers and Parents log in using Internet Identity — if you've lost access, use the 'Forgot/Lost Access' option on the login screen.";
  }
  if (
    q.includes("profile") ||
    q.includes("picture") ||
    q.includes("award") ||
    q.includes("experience")
  ) {
    return "Teachers can update their profile from the Teacher Dashboard — you can upload a profile picture, list teaching experience, and add awards. This information is visible to parents when they view your teacher profile from their dashboard.";
  }
  if (
    q.includes("hello") ||
    q.includes("hi") ||
    q.includes("hey") ||
    q.includes("help")
  ) {
    return "Hello! I'm Helpy 😊 I can help you with quizzes, classes, sessions, grades, reports, tickets, and more. What do you need help with today?";
  }
  return "I'm not sure about that one! For specific issues, try the 'Chat with Admin' tab or submit a ticket under 'Leave a Ticket'. The admin will be happy to help you directly.";
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
  const helpyEndRef = useRef<HTMLDivElement>(null);

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

            <ScrollArea className="flex-1 px-3 py-2">
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
                          <div className="bg-muted rounded-2xl rounded-tl-sm px-2.5 py-1.5">
                            <p className="text-[10px] font-semibold text-violet-600 mb-0.5">
                              Helpy
                            </p>
                            <p className="text-xs text-foreground leading-snug">
                              {msg.text}
                            </p>
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
            </ScrollArea>

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
