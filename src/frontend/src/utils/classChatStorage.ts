// Class chat messages for a given class.

export type ClassChatMessage = {
  id: string;
  classId: string;
  senderUsername: string; // student username or teacher name
  senderRole: "student" | "teacher";
  text: string;
  sentAt: number;
};

function keyFor(classId: string): string {
  return `tuitions_class_chat_${classId}`;
}

export function getClassChatMessages(classId: string): ClassChatMessage[] {
  try {
    const raw = localStorage.getItem(keyFor(classId));
    if (!raw) return [];
    return JSON.parse(raw) as ClassChatMessage[];
  } catch {
    return [];
  }
}

export function sendClassChatMessage(
  classId: string,
  senderUsername: string,
  senderRole: "student" | "teacher",
  text: string,
): ClassChatMessage {
  const msgs = getClassChatMessages(classId);
  const msg: ClassChatMessage = {
    id: `ccm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    classId,
    senderUsername,
    senderRole,
    text: text.trim(),
    sentAt: Date.now(),
  };
  msgs.push(msg);
  localStorage.setItem(keyFor(classId), JSON.stringify(msgs));
  return msg;
}
