import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  type ChatMessage,
  getChatMessages,
  saveChatMessage,
} from "../utils/assignmentStorage";

type ChatWindowProps = {
  bookingId: string;
  bookingLabel: string;
  senderRole: "student" | "teacher" | "parent";
  senderName: string;
  onClose: () => void;
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatWindow({
  bookingId,
  bookingLabel,
  senderRole,
  senderName,
  onClose,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    getChatMessages(bookingId),
  );
  const [inputText, setInputText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Poll every 1.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(getChatMessages(bookingId));
    }, 1500);
    return () => clearInterval(interval);
  }, [bookingId]);

  // Scroll to bottom on new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger on messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const text = inputText.trim();
    if (!text) return;
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      bookingId,
      senderRole,
      senderName,
      text,
      sentAt: Date.now(),
    };
    saveChatMessage(msg);
    setMessages((prev) => [...prev, msg]);
    setInputText("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div
      data-ocid="chat.dialog"
      className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      style={{ maxHeight: "480px" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-bold text-foreground truncate">
            Chat
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {bookingLabel}
          </p>
        </div>
        <Button
          data-ocid="chat.close_button"
          size="icon"
          variant="ghost"
          className="h-7 w-7 flex-shrink-0"
          onClick={onClose}
          aria-label="Close chat"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-2" style={{ height: "300px" }}>
        <div data-ocid="chat.messages.list" className="flex flex-col gap-2">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <MessageSquare className="w-6 h-6 text-muted-foreground opacity-40" />
              <p className="text-xs text-muted-foreground">
                No messages yet. Say hi!
              </p>
            </div>
          )}
          {messages.map((msg) => {
            const isOwn =
              msg.senderRole === senderRole && msg.senderName === senderName;
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] text-muted-foreground px-1">
                  {msg.senderName} · {formatTime(msg.sentAt)}
                </span>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm font-body leading-relaxed text-black ${
                    isOwn
                      ? senderRole === "student"
                        ? "bg-[hsl(var(--student))]"
                        : senderRole === "parent"
                          ? "bg-[hsl(var(--parent))]"
                          : "bg-[hsl(var(--teacher))]"
                      : "bg-muted"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border">
        <Input
          data-ocid="chat.message.input"
          className="flex-1 h-8 text-sm font-body"
          placeholder="Type a message…"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          data-ocid="chat.send_button"
          size="icon"
          className="h-8 w-8 bg-primary hover:bg-primary/90 flex-shrink-0"
          onClick={sendMessage}
          disabled={!inputText.trim()}
          aria-label="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
