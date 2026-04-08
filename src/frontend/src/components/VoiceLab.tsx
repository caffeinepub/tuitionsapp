import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createActorWithConfig } from "@caffeineai/core-infrastructure";
import {
  AlertTriangle,
  Hand,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Users,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";

/** Shorthand: get the backend actor typed to the voice methods we need */
async function getBackendActor(): Promise<{
  createVoiceSession: (
    sessionId: string,
    hostUsername: string,
  ) => Promise<void>;
  joinVoiceSession: (sessionId: string, username: string) => Promise<void>;
  endVoiceSession: (sessionId: string) => Promise<void>;
  sendAudioChunk: (
    sessionId: string,
    senderUsername: string,
    data: Uint8Array,
  ) => Promise<void>;
  pollAudioChunks: (
    sessionId: string,
    since: bigint,
    exclude: string,
  ) => Promise<Array<{ data: Uint8Array; timestamp: bigint }>>;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (await createActorWithConfig(createActor as any)) as any;
}
import type { TeacherClass } from "../utils/classStorage";
import {
  type VoiceRoom,
  createRoom,
  endRoom,
  getActiveRoomForClass,
  getActiveRooms,
  getRoomById,
  giveFloor,
  joinRoom,
  leaveRoom,
  lowerHand,
  muteAll,
  muteParticipant,
  raiseHand,
  setSpeaking,
} from "../utils/voiceChatStorage";

const CLASS_RULES = [
  "Be respectful to all participants.",
  "Stay on topic and keep contributions relevant.",
  "Use the Raise Hand feature before speaking.",
  "Avoid background noise when your mic is active.",
  "No inappropriate language or behaviour.",
];

type Props = {
  currentUsername: string;
  currentDisplayName: string;
  currentRole: "teacher" | "student";
  /** for teacher: their classes; for student: classes they are enrolled in */
  classes: TeacherClass[];
};

// Audio-level indicator bar
function AudioBar({ level }: { level: number }) {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: stable list
          key={i}
          className="w-1 rounded-full transition-all duration-75"
          style={{
            height: `${(i + 1) * 20}%`,
            backgroundColor:
              level >= threshold ? "#2BA870" : "rgba(0,0,0,0.12)",
          }}
        />
      ))}
    </div>
  );
}

// A single participant avatar tile
function ParticipantTile({
  displayName,
  role,
  isSpeaking,
  isMuted,
  hasFloor,
  isMe,
}: {
  displayName: string;
  role: "teacher" | "student";
  isSpeaking: boolean;
  isMuted: boolean;
  hasFloor: boolean;
  isMe: boolean;
}) {
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-base transition-all duration-200"
        style={{
          background:
            role === "teacher"
              ? "linear-gradient(135deg,#2BA870,#1a6b46)"
              : "linear-gradient(135deg,#1B2B50,#2d4a8a)",
          boxShadow: isSpeaking
            ? "0 0 0 3px #2BA870, 0 0 14px 4px rgba(43,168,112,0.5)"
            : hasFloor
              ? "0 0 0 2px #D4A520"
              : "none",
        }}
      >
        {initials}
        {isMuted && (
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <MicOff className="w-2.5 h-2.5 text-white" />
          </span>
        )}
        {!isMuted && hasFloor && !isSpeaking && (
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
            <Mic className="w-2.5 h-2.5 text-white" />
          </span>
        )}
      </div>
      <p className="text-xs text-center text-foreground font-medium leading-tight max-w-[60px] truncate">
        {isMe ? "You" : displayName}
      </p>
      {role === "teacher" && (
        <Badge className="text-[10px] px-1 py-0 h-4 bg-emerald-100 text-emerald-700 border-emerald-200">
          Host
        </Badge>
      )}
    </div>
  );
}

// ── Audio relay helpers ────────────────────────────────────────────────────────

/** Convert a Blob to Uint8Array */
async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const buf = await blob.arrayBuffer();
  return new Uint8Array(buf);
}

/** Play a raw audio Uint8Array received from backend */
function playAudioData(data: Uint8Array): void {
  try {
    // Copy into a fresh ArrayBuffer to satisfy TypeScript's strict buffer types
    const fresh = new ArrayBuffer(data.byteLength);
    new Uint8Array(fresh).set(data);
    const blob = new Blob([fresh], { type: "audio/webm;codecs=opus" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    audio.onerror = () => URL.revokeObjectURL(url);
    audio.play().catch(() => URL.revokeObjectURL(url));
  } catch {
    // ignore playback errors silently
  }
}

export function VoiceLab({
  currentUsername,
  currentDisplayName,
  currentRole,
  classes,
}: Props) {
  const [activeTab, setActiveTab] = useState<"rooms" | "classes">("rooms");
  const [activeRooms, setActiveRooms] = useState<VoiceRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<VoiceRoom | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  // Create room dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomSubject, setNewRoomSubject] = useState("");
  const [newRoomClassId, setNewRoomClassId] = useState<string>("none");

  // Class rules overlay
  const [rulesOpen, setRulesOpen] = useState(false);
  const [pendingJoinRoomId, setPendingJoinRoomId] = useState<string | null>(
    null,
  );
  const [_pendingJoinClassId, setPendingJoinClassId] = useState<string | null>(
    null,
  );

  // Mic / PTT state
  const [micActive, setMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [handRaised, setHandRaised] = useState(false);

  // Audio refs — visual level bars
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const levelTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Audio relay refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioPollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const lastPollTimestampRef = useRef<bigint>(BigInt(0));
  const isSendingRef = useRef(false); // tracks whether we're currently sending

  const myParticipant = currentRoom?.participants.find(
    (p) => p.username.toLowerCase() === currentUsername.toLowerCase(),
  );
  const isInRoom = currentRoom !== null && myParticipant !== undefined;
  const canSpeak =
    currentRole === "teacher" || myParticipant?.hasFloor === true;

  // ── Start audio polling for a session ──────────────────────────────────────
  const startAudioPolling = useCallback(
    (roomId: string) => {
      // Reset timestamp — only receive chunks from now on
      lastPollTimestampRef.current = BigInt(Date.now()) * 1_000_000n; // ms → ns

      audioPollingIntervalRef.current = setInterval(async () => {
        try {
          const actor = await getBackendActor();
          const chunks = await actor.pollAudioChunks(
            roomId,
            lastPollTimestampRef.current,
            currentUsername,
          );
          if (chunks.length > 0) {
            // Update the poll cursor to one nanosecond after the latest chunk
            let maxTs = lastPollTimestampRef.current;
            for (const chunk of chunks) {
              if (chunk.timestamp > maxTs) maxTs = chunk.timestamp;
              playAudioData(chunk.data);
            }
            lastPollTimestampRef.current = maxTs + 1n;
          }
        } catch {
          // ignore transient network errors
        }
      }, 300);
    },
    [currentUsername],
  );

  // ── Stop audio polling ──────────────────────────────────────────────────────
  const stopAudioPolling = useCallback(() => {
    if (audioPollingIntervalRef.current) {
      clearInterval(audioPollingIntervalRef.current);
      audioPollingIntervalRef.current = null;
    }
  }, []);

  // ── Start sending audio via MediaRecorder ──────────────────────────────────
  const startSendingAudio = useCallback(
    (stream: MediaStream, roomId: string) => {
      if (isSendingRef.current) return;
      isSendingRef.current = true;

      // Prefer opus-in-webm if available, fall back to first supported type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const options = mimeType ? { mimeType } : {};
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch {
        recorder = new MediaRecorder(stream);
      }
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (!e.data || e.data.size === 0) return;
        try {
          const bytes = await blobToUint8Array(e.data);
          const actor = await getBackendActor();
          await actor.sendAudioChunk(roomId, currentUsername, bytes);
        } catch {
          // ignore send errors silently
        }
      };

      recorder.start(250); // emit data every 250 ms
    },
    [currentUsername],
  );

  // ── Stop sending audio ──────────────────────────────────────────────────────
  const stopSendingAudio = useCallback(() => {
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch {
        // ignore
      }
      mediaRecorderRef.current = null;
    }
    isSendingRef.current = false;
  }, []);

  const startMic = useCallback(async () => {
    if (!canSpeak) {
      toast.warning("You don't have the floor. Raise your hand to request it.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // ── AudioContext for visual level bars ──────────────────────────────────
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setMicActive(true);
      if (currentRoomId) setSpeaking(currentRoomId, currentUsername, true);

      // Level polling for UI bars
      const data = new Uint8Array(analyser.frequencyBinCount);
      levelTimerRef.current = setInterval(() => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(avg / 128); // 0-1
      }, 80);

      // ── Start sending audio to backend ──────────────────────────────────────
      if (currentRoomId) {
        startSendingAudio(stream, currentRoomId);
      }
    } catch {
      toast.error("Microphone access denied.");
    }
  }, [canSpeak, currentRoomId, currentUsername, startSendingAudio]);

  const stopMic = useCallback(() => {
    // Stop sending audio
    stopSendingAudio();

    if (levelTimerRef.current) clearInterval(levelTimerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    for (const t of streamRef.current?.getTracks() ?? []) {
      t.stop();
    }
    audioCtxRef.current?.close().catch(() => {});
    streamRef.current = null;
    analyserRef.current = null;
    audioCtxRef.current = null;
    setMicActive(false);
    setAudioLevel(0);
    if (currentRoomId) setSpeaking(currentRoomId, currentUsername, false);
  }, [currentRoomId, currentUsername, stopSendingAudio]);

  const handleForcedEnd = useCallback(() => {
    stopMic();
    stopAudioPolling();
    setCurrentRoom(null);
    setCurrentRoomId(null);
    setHandRaised(false);
    toast.info("The voice session has ended.");
  }, [stopMic, stopAudioPolling]);

  // Poll room state every second (local state sync)
  useEffect(() => {
    const tick = () => {
      setActiveRooms(getActiveRooms());
      if (currentRoomId) {
        const fresh = getRoomById(currentRoomId);
        if (fresh) {
          setCurrentRoom(fresh);
          if (!fresh.isActive) {
            handleForcedEnd();
          }
        }
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    const onStorage = () => tick();
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(id);
      window.removeEventListener("storage", onStorage);
    };
  }, [currentRoomId, handleForcedEnd]);

  // Cleanup on unmount or room leave
  useEffect(() => {
    return () => {
      stopMic();
      stopAudioPolling();
    };
  }, [stopMic, stopAudioPolling]);

  const requestJoin = (roomId: string, classId?: string) => {
    setPendingJoinRoomId(roomId);
    setPendingJoinClassId(classId ?? null);
    setRulesOpen(true);
  };

  const confirmJoin = () => {
    setRulesOpen(false);
    if (pendingJoinRoomId) {
      doJoin(pendingJoinRoomId);
    }
    setPendingJoinRoomId(null);
    setPendingJoinClassId(null);
  };

  const doJoin = async (roomId: string) => {
    const updated = joinRoom(
      roomId,
      currentUsername,
      currentDisplayName,
      currentRole,
    );
    if (!updated) {
      toast.error("Could not join room. It may have ended.");
      return;
    }
    setCurrentRoom(updated);
    setCurrentRoomId(roomId);

    // Sync join to backend for audio relay
    try {
      const actor = await getBackendActor();
      await actor.joinVoiceSession(roomId, currentUsername);
    } catch {
      // non-fatal: continue even if backend call fails
    }

    // Start receiving audio from other participants
    startAudioPolling(roomId);
    toast.success(`Joined "${updated.name}"`);
  };

  const doLeave = async () => {
    stopMic();
    stopAudioPolling();
    if (currentRoomId) {
      leaveRoom(currentRoomId, currentUsername);
    }
    setCurrentRoom(null);
    setCurrentRoomId(null);
    setHandRaised(false);
    toast.info("You have left the voice room.");
  };

  const doEndSession = async () => {
    if (!currentRoomId) return;
    stopMic();
    stopAudioPolling();
    endRoom(currentRoomId);

    // End backend session
    try {
      const actor = await getBackendActor();
      await actor.endVoiceSession(currentRoomId);
    } catch {
      // non-fatal
    }

    setCurrentRoom(null);
    setCurrentRoomId(null);
    setHandRaised(false);
    toast.success("Voice session ended.");
  };

  const doCreateRoom = async () => {
    if (!newRoomName.trim() || !newRoomSubject.trim()) {
      toast.warning("Please enter a room name and subject.");
      return;
    }
    const classId = newRoomClassId !== "none" ? newRoomClassId : undefined;
    const room = createRoom(
      newRoomName,
      newRoomSubject,
      currentUsername,
      currentDisplayName,
      classId,
    );
    setCreateOpen(false);
    setNewRoomName("");
    setNewRoomSubject("");
    setNewRoomClassId("none");
    setCurrentRoom(room);
    setCurrentRoomId(room.id);

    // Register session in backend for audio relay
    try {
      const actor = await getBackendActor();
      await actor.createVoiceSession(room.id, currentUsername);
    } catch {
      // non-fatal
    }

    // Start polling so the teacher can hear joining students
    startAudioPolling(room.id);
    toast.success(`Room "${room.name}" created!`);
  };

  const doMuteAll = () => {
    if (!currentRoomId) return;
    muteAll(currentRoomId);
    toast.success("All students muted.");
  };

  const doGiveFloor = (username: string) => {
    if (!currentRoomId) return;
    giveFloor(currentRoomId, username);
    toast.success(`Floor given to ${username}.`);
  };

  const doMuteParticipant = (username: string) => {
    if (!currentRoomId) return;
    muteParticipant(currentRoomId, username);
  };

  const doRaiseHand = () => {
    if (!currentRoomId) return;
    if (handRaised) {
      lowerHand(currentRoomId, currentUsername);
      setHandRaised(false);
      toast.info("Hand lowered.");
    } else {
      raiseHand(currentRoomId, currentUsername);
      setHandRaised(true);
      toast.info("Hand raised! Waiting for the teacher to give you the floor.");
    }
  };

  // Sort participants: speaking first, then by role (teacher first), then name
  const sortedParticipants = currentRoom
    ? [...currentRoom.participants].sort((a, b) => {
        if (a.isSpeaking !== b.isSpeaking) return a.isSpeaking ? -1 : 1;
        if (a.role !== b.role) return a.role === "teacher" ? -1 : 1;
        return a.displayName.localeCompare(b.displayName);
      })
    : [];

  // Rooms available for student: all active, or teacher's own
  const visibleRooms =
    currentRole === "teacher"
      ? activeRooms.filter(
          (r) => r.hostUsername.toLowerCase() === currentUsername.toLowerCase(),
        )
      : activeRooms;

  // ─── Inside-room view ────────────────────────────────────────────────────
  if (isInRoom && currentRoom) {
    const handQueue = currentRoom.handRaiseQueue;
    return (
      <div className="max-w-4xl mx-auto">
        {/* Room header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <h2 className="font-display text-xl font-bold text-foreground">
                {currentRoom.name}
              </h2>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                Live
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentRoom.subject} &bull; {currentRoom.participants.length}{" "}
              participant
              {currentRoom.participants.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            {currentRole === "teacher" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={doMuteAll}
                  className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                >
                  <MicOff className="w-3.5 h-3.5" />
                  Mute All
                </Button>
                <Button
                  size="sm"
                  onClick={doEndSession}
                  className="gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  End Session
                </Button>
              </>
            )}
            {currentRole === "student" && (
              <Button
                size="sm"
                variant="outline"
                onClick={doLeave}
                className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                Leave
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Participants */}
          <div className="lg:col-span-2">
            <Card className="border-border/60 shadow-xs">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Participants
                </p>
                <div className="flex flex-wrap gap-5">
                  {sortedParticipants.map((p) => (
                    <div key={p.username} className="relative group">
                      <ParticipantTile
                        displayName={p.displayName}
                        role={p.role}
                        isSpeaking={p.isSpeaking}
                        isMuted={p.isMuted}
                        hasFloor={p.hasFloor}
                        isMe={
                          p.username.toLowerCase() ===
                          currentUsername.toLowerCase()
                        }
                      />
                      {/* Teacher can mute individual students */}
                      {currentRole === "teacher" &&
                        p.role === "student" &&
                        !p.isMuted && (
                          <button
                            type="button"
                            onClick={() => doMuteParticipant(p.username)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center hidden group-hover:flex"
                            title="Mute"
                          >
                            <MicOff className="w-2.5 h-2.5 text-white" />
                          </button>
                        )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* PTT + Raise Hand controls */}
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              {/* Push-to-talk */}
              <button
                type="button"
                onMouseDown={startMic}
                onMouseUp={stopMic}
                onTouchStart={startMic}
                onTouchEnd={stopMic}
                onPointerDown={startMic}
                onPointerUp={stopMic}
                disabled={!canSpeak}
                className={`select-none flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                  micActive
                    ? "bg-emerald-500 text-white shadow-lg scale-95 ring-4 ring-emerald-300"
                    : canSpeak
                      ? "bg-card border-2 border-emerald-400 text-emerald-700 hover:bg-emerald-50 active:scale-95"
                      : "bg-card border-2 border-border text-muted-foreground cursor-not-allowed opacity-50"
                }`}
              >
                {micActive ? (
                  <Mic className="w-4 h-4 animate-pulse" />
                ) : (
                  <MicOff className="w-4 h-4" />
                )}
                {micActive ? "Speaking..." : "Hold to Speak"}
                {micActive && <AudioBar level={audioLevel} />}
              </button>

              {/* Raise hand — students only */}
              {currentRole === "student" && (
                <Button
                  variant="outline"
                  onClick={doRaiseHand}
                  className={`gap-2 font-semibold ${
                    handRaised
                      ? "bg-amber-100 border-amber-400 text-amber-700"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <Hand className="w-4 h-4" />
                  {handRaised ? "Lower Hand" : "Raise Hand"}
                </Button>
              )}

              {/* Audio level indicator */}
              {micActive && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                  <AudioBar level={audioLevel} />
                  <span>Mic Active</span>
                </div>
              )}
            </div>

            {!canSpeak && currentRole === "student" && (
              <p className="mt-2 text-xs text-muted-foreground">
                Raise your hand and wait for the teacher to give you the floor.
              </p>
            )}
          </div>

          {/* Sidebar: hand raise queue (teacher only) */}
          {currentRole === "teacher" && (
            <div>
              <Card className="border-border/60 shadow-xs">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Hand className="w-3.5 h-3.5 text-amber-500" />
                    Hand Raise Queue
                    {handQueue.length > 0 && (
                      <Badge className="ml-1 bg-amber-100 text-amber-700 border-amber-200 text-xs">
                        {handQueue.length}
                      </Badge>
                    )}
                  </p>
                  {handQueue.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No hands raised
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {handQueue.map((username, idx) => {
                        const participant = currentRoom.participants.find(
                          (p) =>
                            p.username.toLowerCase() === username.toLowerCase(),
                        );
                        return (
                          <div
                            key={username}
                            className="flex items-center justify-between gap-2 p-2 rounded-lg bg-amber-50 border border-amber-100"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-amber-600 w-4">
                                {idx + 1}.
                              </span>
                              <span className="text-sm font-medium text-foreground">
                                {participant?.displayName ?? username}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => doGiveFloor(username)}
                              className="h-6 text-xs px-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                            >
                              Give Floor
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Room list / lobby view ───────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-500" />
            Voice Lab
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audio-only voice sessions for students and teachers.
          </p>
        </div>
        {currentRole === "teacher" && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2"
          >
            <Radio className="w-4 h-4" />
            Start Session
          </Button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-muted rounded-xl p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("rooms")}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "rooms"
              ? "bg-white shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Voice Rooms
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("classes")}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "classes"
              ? "bg-white shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Class Voice Hub
        </button>
      </div>

      {/* ── Voice Rooms tab ── */}
      {activeTab === "rooms" && (
        <div>
          {visibleRooms.filter((r) => !r.classId).length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border/60">
              <Radio className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-foreground mb-1">
                {currentRole === "teacher"
                  ? "No active sessions yet"
                  : "No active voice rooms"}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentRole === "teacher"
                  ? 'Click "Start Session" to create one.'
                  : "Wait for your teacher to start a session."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {visibleRooms
                .filter((r) => !r.classId)
                .map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    currentRole={currentRole}
                    currentUsername={currentUsername}
                    onJoin={() => requestJoin(room.id)}
                    onEnd={async () => {
                      endRoom(room.id);
                      try {
                        const actor = await getBackendActor();
                        await actor.endVoiceSession(room.id);
                      } catch {
                        // non-fatal
                      }
                      toast.success("Room ended.");
                    }}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── Class Voice Hub tab ── */}
      {activeTab === "classes" && (
        <div>
          {classes.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border/60">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-foreground mb-1">
                No classes found
              </p>
              <p className="text-sm text-muted-foreground">
                {currentRole === "teacher"
                  ? "Create a class first to start a class voice session."
                  : "Join a class to access the Class Voice Hub."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map((cls) => {
                const activeRoom = getActiveRoomForClass(cls.id);
                return (
                  <ClassVoiceCard
                    key={cls.id}
                    cls={cls}
                    activeRoom={activeRoom}
                    currentRole={currentRole}
                    currentUsername={currentUsername}
                    currentDisplayName={currentDisplayName}
                    onStartSession={async () => {
                      const room = createRoom(
                        cls.name,
                        cls.subject,
                        currentUsername,
                        currentDisplayName,
                        cls.id,
                      );
                      setCurrentRoom(room);
                      setCurrentRoomId(room.id);

                      // Register in backend for audio relay
                      try {
                        const actor = await getBackendActor();
                        await actor.createVoiceSession(
                          room.id,
                          currentUsername,
                        );
                      } catch {
                        // non-fatal
                      }

                      startAudioPolling(room.id);
                      toast.success(`Class session started for ${cls.name}`);
                    }}
                    onJoin={() => requestJoin(activeRoom!.id, cls.id)}
                    onEnd={async () => {
                      if (activeRoom) {
                        stopMic();
                        stopAudioPolling();
                        endRoom(activeRoom.id);

                        try {
                          const actor = await getBackendActor();
                          await actor.endVoiceSession(activeRoom.id);
                        } catch {
                          // non-fatal
                        }

                        toast.success("Class session ended.");
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Room dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500" />
              Start a Voice Session
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Room Name</Label>
              <Input
                placeholder="e.g. Grade 10 Math Help"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input
                placeholder="e.g. Mathematics"
                value={newRoomSubject}
                onChange={(e) => setNewRoomSubject(e.target.value)}
              />
            </div>
            {classes.length > 0 && (
              <div className="space-y-1.5">
                <Label>Link to Class (optional)</Label>
                <select
                  value={newRoomClassId}
                  onChange={(e) => setNewRoomClassId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="none">No class link</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.subject})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={doCreateRoom}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Create Room
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Class Rules overlay */}
      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Class Protocols
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-4">
              Please read and agree to the following rules before joining:
            </p>
            <ul className="space-y-2">
              {CLASS_RULES.map((rule) => (
                <li key={rule} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    ✓
                  </span>
                  {rule}
                </li>
              ))}
            </ul>
            <div className="flex gap-2 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setRulesOpen(false);
                  setPendingJoinRoomId(null);
                  setPendingJoinClassId(null);
                }}
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Cancel
              </Button>
              <Button
                onClick={confirmJoin}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                I Agree — Join Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Room Card (lobby) ────────────────────────────────────────────────────────
function RoomCard({
  room,
  currentRole: _currentRole,
  currentUsername,
  onJoin,
  onEnd,
}: {
  room: VoiceRoom;
  currentRole: "teacher" | "student";
  currentUsername: string;
  onJoin: () => void;
  onEnd: () => void;
}) {
  const isHost =
    room.hostUsername.toLowerCase() === currentUsername.toLowerCase();
  return (
    <Card className="border-border/60 shadow-xs hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Radio className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">
                {room.name}
              </p>
              <p className="text-xs text-muted-foreground">{room.subject}</p>
            </div>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 mb-4">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {room.participants.length} participant
            {room.participants.length !== 1 ? "s" : ""} &bull; Host:{" "}
            {room.hostName}
          </p>
        </div>
        <div className="flex gap-2">
          {isHost ? (
            <Button
              size="sm"
              onClick={onEnd}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 font-semibold gap-1.5 w-full"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              End Room
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onJoin}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 w-full"
            >
              <Mic className="w-3.5 h-3.5" />
              Join Session
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Class Voice Card ─────────────────────────────────────────────────────────
function ClassVoiceCard({
  cls,
  activeRoom,
  currentRole,
  currentUsername: _currentUsername,
  currentDisplayName,
  onStartSession,
  onJoin,
  onEnd,
}: {
  cls: TeacherClass;
  activeRoom: VoiceRoom | null;
  currentRole: "teacher" | "student";
  currentUsername: string;
  currentDisplayName: string;
  onStartSession: () => void;
  onJoin: () => void;
  onEnd: () => void;
}) {
  const isHost =
    currentRole === "teacher" &&
    cls.teacherName.toLowerCase() === currentDisplayName.toLowerCase();
  return (
    <Card className="border-border/60 shadow-xs">
      <CardContent className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">{cls.name}</p>
              <p className="text-xs text-muted-foreground">
                {cls.subject} &bull; {cls.studentUsernames.length} student
                {cls.studentUsernames.length !== 1 ? "s" : ""} &bull; Host:{" "}
                {cls.teacherName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeRoom ? (
              <>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Session Active &bull; {activeRoom.participants.length} joined
                </Badge>
                {isHost ? (
                  <Button
                    size="sm"
                    onClick={onEnd}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 font-semibold gap-1.5"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    End Class
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={onJoin}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Join
                  </Button>
                )}
              </>
            ) : (
              <>
                <Badge className="bg-muted text-muted-foreground border-border text-xs">
                  No active session
                </Badge>
                {isHost && (
                  <Button
                    size="sm"
                    onClick={onStartSession}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    Start Class
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
