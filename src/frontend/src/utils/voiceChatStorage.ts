// Voice Chat Storage — all state is persisted in localStorage and synced
// via the storage event so multiple tabs see updates.
// Audio relay is handled via the backend canister (sendAudioChunk / pollAudioChunks).

const VOICE_ROOMS_KEY = "ts_voice_rooms_v1";

export type VoiceParticipant = {
  username: string;
  displayName: string;
  role: "teacher" | "student";
  isMuted: boolean;
  isSpeaking: boolean;
  joinedAt: number;
  hasFloor: boolean; // unmuted by teacher
};

export type VoiceRoom = {
  id: string;
  name: string;
  subject: string;
  hostUsername: string; // teacher's username/identifier
  hostName: string; // teacher's display name
  classId?: string; // if linked to a TeacherClass
  participants: VoiceParticipant[];
  handRaiseQueue: string[]; // usernames in order of hand raise
  isActive: boolean;
  createdAt: number;
  endedAt?: number;
};

function readRooms(): VoiceRoom[] {
  try {
    const raw = localStorage.getItem(VOICE_ROOMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as VoiceRoom[];
  } catch {
    return [];
  }
}

function writeRooms(rooms: VoiceRoom[]): void {
  localStorage.setItem(VOICE_ROOMS_KEY, JSON.stringify(rooms));
}

export function getActiveRooms(): VoiceRoom[] {
  return readRooms().filter((r) => r.isActive);
}

export function getActiveRoomsForTeacher(hostUsername: string): VoiceRoom[] {
  return getActiveRooms().filter(
    (r) => r.hostUsername.toLowerCase() === hostUsername.toLowerCase(),
  );
}

export function getActiveRoomForClass(classId: string): VoiceRoom | null {
  return (
    getActiveRooms().find((r) => r.classId === classId && r.isActive) ?? null
  );
}

export function createRoom(
  name: string,
  subject: string,
  hostUsername: string,
  hostName: string,
  classId?: string,
): VoiceRoom {
  const rooms = readRooms();
  const room: VoiceRoom = {
    id: `vr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    subject: subject.trim(),
    hostUsername,
    hostName,
    classId,
    participants: [
      {
        username: hostUsername,
        displayName: hostName,
        role: "teacher",
        isMuted: false,
        isSpeaking: false,
        joinedAt: Date.now(),
        hasFloor: true,
      },
    ],
    handRaiseQueue: [],
    isActive: true,
    createdAt: Date.now(),
  };
  rooms.push(room);
  writeRooms(rooms);
  return room;
}

export function endRoom(roomId: string): void {
  const rooms = readRooms();
  const idx = rooms.findIndex((r) => r.id === roomId);
  if (idx === -1) return;
  rooms[idx] = { ...rooms[idx], isActive: false, endedAt: Date.now() };
  writeRooms(rooms);
}

export function joinRoom(
  roomId: string,
  username: string,
  displayName: string,
  role: "teacher" | "student",
): VoiceRoom | null {
  const rooms = readRooms();
  const idx = rooms.findIndex((r) => r.id === roomId && r.isActive);
  if (idx === -1) return null;
  const room = rooms[idx];
  // already in room
  if (
    room.participants.some(
      (p) => p.username.toLowerCase() === username.toLowerCase(),
    )
  ) {
    return room;
  }
  const participant: VoiceParticipant = {
    username,
    displayName,
    role,
    isMuted: role === "student", // students start muted
    isSpeaking: false,
    joinedAt: Date.now(),
    hasFloor: role === "teacher",
  };
  rooms[idx] = {
    ...room,
    participants: [...room.participants, participant],
  };
  writeRooms(rooms);
  return rooms[idx];
}

export function leaveRoom(roomId: string, username: string): void {
  const rooms = readRooms();
  const idx = rooms.findIndex((r) => r.id === roomId);
  if (idx === -1) return;
  rooms[idx] = {
    ...rooms[idx],
    participants: rooms[idx].participants.filter(
      (p) => p.username.toLowerCase() !== username.toLowerCase(),
    ),
    handRaiseQueue: rooms[idx].handRaiseQueue.filter(
      (u) => u.toLowerCase() !== username.toLowerCase(),
    ),
  };
  writeRooms(rooms);
}

export function muteAll(roomId: string): void {
  const rooms = readRooms();
  const idx = rooms.findIndex((r) => r.id === roomId);
  if (idx === -1) return;
  rooms[idx] = {
    ...rooms[idx],
    participants: rooms[idx].participants.map((p) =>
      p.role === "student"
        ? { ...p, isMuted: true, isSpeaking: false, hasFloor: false }
        : p,
    ),
    handRaiseQueue: [],
  };
  writeRooms(rooms);
}

export function muteParticipant(roomId: string, username: string): void {
  const rooms = readRooms();
  const idx = rooms.findIndex((r) => r.id === roomId);
  if (idx === -1) return;
  rooms[idx] = {
    ...rooms[idx],
    participants: rooms[idx].participants.map((p) =>
      p.username.toLowerCase() === username.toLowerCase()
        ? { ...p, isMuted: true, isSpeaking: false, hasFloor: false }
        : p,
    ),
    handRaiseQueue: rooms[idx].handRaiseQueue.filter(
      (u) => u.toLowerCase() !== username.toLowerCase(),
    ),
  };
  writeRooms(rooms);
}

export function raiseHand(roomId: string, username: string): void {
  const rooms = readRooms();
  const idx = rooms.findIndex((r) => r.id === roomId);
  if (idx === -1) return;
  const room = rooms[idx];
  if (
    room.handRaiseQueue.some((u) => u.toLowerCase() === username.toLowerCase())
  )
    return;
  rooms[idx] = {
    ...room,
    handRaiseQueue: [...room.handRaiseQueue, username],
  };
  writeRooms(rooms);
}

export function lowerHand(roomId: string, username: string): void {
  const rooms = readRooms();
  const idx = rooms.findIndex((r) => r.id === roomId);
  if (idx === -1) return;
  rooms[idx] = {
    ...rooms[idx],
    handRaiseQueue: rooms[idx].handRaiseQueue.filter(
      (u) => u.toLowerCase() !== username.toLowerCase(),
    ),
  };
  writeRooms(rooms);
}

export function giveFloor(roomId: string, username: string): void {
  const rooms = readRooms();
  const idx = rooms.findIndex((r) => r.id === roomId);
  if (idx === -1) return;
  rooms[idx] = {
    ...rooms[idx],
    participants: rooms[idx].participants.map((p) =>
      p.username.toLowerCase() === username.toLowerCase()
        ? { ...p, isMuted: false, hasFloor: true }
        : p,
    ),
    handRaiseQueue: rooms[idx].handRaiseQueue.filter(
      (u) => u.toLowerCase() !== username.toLowerCase(),
    ),
  };
  writeRooms(rooms);
}

export function setSpeaking(
  roomId: string,
  username: string,
  isSpeaking: boolean,
): void {
  const rooms = readRooms();
  const idx = rooms.findIndex((r) => r.id === roomId);
  if (idx === -1) return;
  rooms[idx] = {
    ...rooms[idx],
    participants: rooms[idx].participants.map((p) =>
      p.username.toLowerCase() === username.toLowerCase()
        ? { ...p, isSpeaking }
        : p,
    ),
  };
  writeRooms(rooms);
}

export function getRoomById(roomId: string): VoiceRoom | null {
  return readRooms().find((r) => r.id === roomId) ?? null;
}
