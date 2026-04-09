import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  GamepadIcon,
  Lock,
  RefreshCcw,
  Star,
  Trophy,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type MCQQuestion,
  type MemoryPair,
  SUBJECT_CATEGORIES,
  type ScrambleWord,
  type TrueFalseQuestion,
  getGameData,
  scrambleWord,
  shuffleArray,
} from "../utils/learningGamesData";
import { getStudentAge } from "../utils/studentStorage";

/** Finds the age of the currently logged-in student by matching the most
 *  recently pinged username in the online-status map against stored profiles. */
function getCurrentStudentAge(): number | null {
  try {
    const raw = localStorage.getItem("tuitions_student_online_status");
    if (!raw) return null;
    const status: Record<string, number> = JSON.parse(raw);
    const now = Date.now();
    // Pick the username most recently active (within 60 s to be safe)
    const active = Object.entries(status)
      .filter(([, ts]) => now - ts < 60000)
      .sort((a, b) => b[1] - a[1]);
    if (active.length === 0) return null;
    const username = active[0][0];
    return getStudentAge(username);
  } catch {
    return null;
  }
}

type Screen = "subjects" | "hub" | "game";
type GameType = "mcq" | "scramble" | "memory" | "truefalse";

export function LearningGames() {
  const [screen, setScreen] = useState<Screen>("subjects");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [gameType, setGameType] = useState<GameType>("mcq");

  function pickSubject(subject: string) {
    setSelectedSubject(subject);
    setScreen("hub");
  }

  function pickGame(g: GameType) {
    setGameType(g);
    setScreen("game");
  }

  function goBack() {
    if (screen === "game") setScreen("hub");
    else if (screen === "hub") setScreen("subjects");
  }

  return (
    <div className="rounded-xl border border-border/60 shadow-sm bg-card overflow-hidden">
      {screen !== "subjects" && (
        <div className="px-5 pt-4 pb-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
            onClick={goBack}
          >
            <ChevronLeft className="w-4 h-4" />
            {screen === "game" ? selectedSubject : "All Subjects"}
          </Button>
        </div>
      )}

      {screen === "subjects" && <SubjectSelectScreen onSelect={pickSubject} />}
      {screen === "hub" && (
        <GameHubScreen subject={selectedSubject} onPickGame={pickGame} />
      )}
      {screen === "game" && (
        <ActiveGame
          subject={selectedSubject}
          gameType={gameType}
          onBack={() => setScreen("hub")}
        />
      )}
    </div>
  );
}

// ─── Subject Select ──────────────────────────────────────────────────────────
function SubjectSelectScreen({ onSelect }: { onSelect: (s: string) => void }) {
  const [openCategory, setOpenCategory] = useState<string>("core");
  const studentAge = getCurrentStudentAge();

  return (
    <div className="p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-student-light flex items-center justify-center">
          <GamepadIcon className="w-5 h-5 text-student" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Learning Games
          </h3>
          <p className="text-xs text-muted-foreground">
            Pick a subject and play to learn!
          </p>
        </div>
      </div>

      {studentAge === null && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2">
          <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            Add your date of birth in your profile to unlock age-appropriate
            subjects.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {SUBJECT_CATEGORIES.map((cat) => {
          const isLocked = studentAge !== null && studentAge < cat.ageMin;

          return (
            <div
              key={cat.id}
              className={`rounded-xl border overflow-hidden transition-opacity ${
                isLocked ? "border-border/40 opacity-70" : "border-border/60"
              }`}
            >
              <button
                type="button"
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left ${
                  isLocked
                    ? "bg-muted/20 cursor-default"
                    : "bg-muted/30 hover:bg-muted/50 cursor-pointer"
                }`}
                onClick={() => {
                  if (!isLocked) {
                    setOpenCategory(openCategory === cat.id ? "" : cat.id);
                  }
                }}
              >
                <span className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <span className={`text-base ${isLocked ? "grayscale" : ""}`}>
                    {cat.emoji}
                  </span>
                  <span className={isLocked ? "text-muted-foreground" : ""}>
                    {cat.name}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  {isLocked ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#1B2B50]">
                      <Lock className="w-3 h-3" />
                      Age {cat.ageMin}+
                    </span>
                  ) : (
                    <span
                      className={`text-muted-foreground transition-transform duration-200 ${
                        openCategory === cat.id ? "rotate-180" : ""
                      }`}
                    >
                      ▾
                    </span>
                  )}
                </span>
              </button>

              {!isLocked && openCategory === cat.id && (
                <div className="px-4 py-3 flex flex-wrap gap-2 bg-background">
                  {cat.subjects.map((subject) => (
                    <button
                      type="button"
                      key={subject}
                      onClick={() => onSelect(subject)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-student-light text-student hover:bg-student hover:text-white transition-colors duration-150 border border-student/20"
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              )}

              {isLocked && (
                <div className="px-4 py-2.5 bg-muted/10 border-t border-border/30 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-muted-foreground/60" />
                  <p className="text-[11px] text-muted-foreground/70">
                    Available from age {cat.ageMin}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Game Hub ────────────────────────────────────────────────────────────────
const GAME_MODES: {
  id: GameType;
  emoji: string;
  title: string;
  desc: string;
  color: string;
}[] = [
  {
    id: "mcq",
    emoji: "🧠",
    title: "Flashcard Quiz",
    desc: "10 questions · 20s each · scored",
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    id: "scramble",
    emoji: "🔤",
    title: "Word Scramble",
    desc: "Unscramble 8 words with hints",
    color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
  },
  {
    id: "memory",
    emoji: "🃏",
    title: "Memory Match",
    desc: "Match 8 pairs of cards",
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  },
  {
    id: "truefalse",
    emoji: "✅",
    title: "True or False",
    desc: "Quick fire · 10 statements",
    color: "bg-green-50 border-green-200 hover:bg-green-100",
  },
];

function GameHubScreen({
  subject,
  onPickGame,
}: { subject: string; onPickGame: (g: GameType) => void }) {
  return (
    <div className="p-5">
      <div className="mb-5">
        <h3 className="font-display text-xl font-bold text-foreground">
          {subject}
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Choose a game mode to start learning!
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GAME_MODES.map((mode) => (
          <button
            type="button"
            key={mode.id}
            onClick={() => onPickGame(mode.id)}
            className={`rounded-xl border p-4 text-left transition-all duration-150 ${mode.color}`}
          >
            <div className="text-2xl mb-2">{mode.emoji}</div>
            <p className="font-display font-bold text-sm text-foreground">
              {mode.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{mode.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Active Game Router ──────────────────────────────────────────────────────
function ActiveGame({
  subject,
  gameType,
  onBack,
}: { subject: string; gameType: GameType; onBack: () => void }) {
  const data = getGameData(subject);
  if (gameType === "mcq")
    return (
      <MCQGame
        questions={shuffleArray(data.mcq).slice(0, 10)}
        subject={subject}
        onBack={onBack}
      />
    );
  if (gameType === "scramble")
    return (
      <ScrambleGame
        words={shuffleArray(data.wordScramble).slice(0, 8)}
        subject={subject}
        onBack={onBack}
      />
    );
  if (gameType === "memory")
    return (
      <MemoryGame
        pairs={shuffleArray(data.memoryPairs).slice(0, 8)}
        subject={subject}
        onBack={onBack}
      />
    );
  return (
    <TrueFalseGame
      questions={shuffleArray(data.trueOrFalse).slice(0, 10)}
      subject={subject}
      onBack={onBack}
    />
  );
}

// ─── Score Screen ────────────────────────────────────────────────────────────
function ScoreScreen({
  score,
  total,
  onReplay,
  onBack,
}: { score: number; total: number; onReplay: () => void; onBack: () => void }) {
  const pct = total > 0 ? score / total : 0;
  const stars = pct >= 0.8 ? 3 : pct >= 0.5 ? 2 : 1;
  const msg =
    stars === 3
      ? "Outstanding! 🎉"
      : stars === 2
        ? "Good job! Keep it up! 💪"
        : "Keep practising, you'll get there! 💫";

  return (
    <div className="p-8 flex flex-col items-center text-center gap-4">
      <Trophy className="w-12 h-12 text-amber-400" />
      <div className="flex gap-1">
        {[1, 2, 3].map((s) => (
          <Star
            key={s}
            className={`w-7 h-7 ${s <= stars ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
          />
        ))}
      </div>
      <div>
        <p className="font-display text-4xl font-bold text-foreground">
          {score} / {total}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{msg}</p>
      </div>
      <div className="flex gap-3 mt-2">
        <Button variant="outline" onClick={onBack} className="gap-1.5">
          <ChevronLeft className="w-4 h-4" /> Change Game
        </Button>
        <Button
          className="bg-student hover:bg-student/90 text-white gap-1.5"
          onClick={onReplay}
        >
          <RefreshCcw className="w-4 h-4" /> Play Again
        </Button>
      </div>
    </div>
  );
}

// ─── MCQ Game ────────────────────────────────────────────────────────────────
function MCQGame({
  questions,
  subject: _subject,
  onBack,
}: { questions: MCQQuestion[]; subject: string; onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [key, setKey] = useState(0);

  const advance = useCallback(() => {
    if (idx + 1 >= questions.length) {
      setDone(true);
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
      setTimeLeft(20);
    }
  }, [idx, questions.length]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: advance is stable
  useEffect(() => {
    if (done || selected !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setSelected(-1);
          setTimeout(advance, 1500);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [idx, done, selected, advance]);

  function handleAnswer(optIdx: number) {
    if (selected !== null) return;
    clearInterval(timerRef.current!);
    setSelected(optIdx);
    if (optIdx === questions[idx].answer) setScore((s) => s + 1);
    setTimeout(advance, 1500);
  }

  function replay() {
    setIdx(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setTimeLeft(20);
    setKey((k) => k + 1);
  }

  if (done)
    return (
      <ScoreScreen
        score={score}
        total={questions.length}
        onReplay={replay}
        onBack={onBack}
      />
    );

  const q = questions[idx];

  return (
    <div key={key} className="p-5 space-y-4">
      <div className="flex items-center justify-between text-sm">
        <Badge variant="outline" className="text-xs">
          {idx + 1} / {questions.length}
        </Badge>
        <div
          className={`font-mono text-sm font-bold ${timeLeft <= 5 ? "text-red-500" : "text-muted-foreground"}`}
        >
          ⏱ {timeLeft}s
        </div>
      </div>
      <Progress value={(timeLeft / 20) * 100} className="h-1.5" />
      <p className="font-display font-bold text-base text-foreground leading-snug">
        {q.question}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          let cls =
            "border rounded-lg px-4 py-3 text-sm text-left transition-all duration-150 font-medium ";
          if (selected === null) {
            cls +=
              "border-border hover:bg-student-light hover:border-student cursor-pointer bg-background";
          } else if (i === q.answer) {
            cls += "bg-green-50 border-green-400 text-green-800";
          } else if (i === selected) {
            cls += "bg-red-50 border-red-400 text-red-800";
          } else {
            cls += "border-border bg-muted/30 text-muted-foreground";
          }
          return (
            <button
              type="button"
              key={opt}
              className={cls}
              onClick={() => handleAnswer(i)}
            >
              <span className="font-bold text-xs mr-2 opacity-60">
                {["A", "B", "C", "D"][i]}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && q.explanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-800">
          💡 {q.explanation}
        </div>
      )}
    </div>
  );
}

// ─── Scramble Game ───────────────────────────────────────────────────────────
function ScrambleGame({
  words,
  subject: _subject,
  onBack,
}: { words: ScrambleWord[]; subject: string; onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [scrambled, setScrambled] = useState(() => scrambleWord(words[0].word));

  function replay() {
    setIdx(0);
    setInput("");
    setFeedback(null);
    setScore(0);
    setDone(false);
    setScrambled(scrambleWord(words[0].word));
  }

  function advance(wasCorrect: boolean) {
    if (wasCorrect) setScore((s) => s + 1);
    const next = idx + 1;
    if (next >= words.length) {
      setDone(true);
    } else {
      setIdx(next);
      setInput("");
      setFeedback(null);
      setScrambled(scrambleWord(words[next].word));
    }
  }

  function submit() {
    if (!input.trim()) return;
    const correct =
      input.trim().toUpperCase() === words[idx].word.toUpperCase();
    setFeedback(correct ? "correct" : "wrong");
    setTimeout(() => advance(correct), 1200);
  }

  function skip() {
    setFeedback(null);
    advance(false);
  }

  if (done)
    return (
      <ScoreScreen
        score={score}
        total={words.length}
        onReplay={replay}
        onBack={onBack}
      />
    );

  const w = words[idx];

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {idx + 1} / {words.length}
        </Badge>
        <span className="text-xs text-muted-foreground">Score: {score}</span>
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-3">
          Unscramble this word:
        </p>
        <div className="flex justify-center flex-wrap gap-2 mb-3">
          {scrambled.split("").map((ch, i) => (
            <span
              key={ch + String(i)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-amber-50 border border-amber-200 font-display font-bold text-lg text-amber-700"
            >
              {ch}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic">
          💡 Hint: {w.hint}
        </p>
      </div>

      {feedback === "correct" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center text-green-700 font-semibold text-sm">
          ✅ Correct! The word is <strong>{w.word}</strong>
        </div>
      )}
      {feedback === "wrong" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center text-red-700 font-semibold text-sm">
          ❌ The correct answer was <strong>{w.word}</strong>
        </div>
      )}

      {feedback === null && (
        <div className="flex gap-2">
          <Input
            placeholder="Type your answer..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="flex-1"
            autoFocus
          />
          <Button
            className="bg-student hover:bg-student/90 text-white"
            onClick={submit}
            disabled={!input.trim()}
          >
            Check
          </Button>
          <Button variant="outline" onClick={skip}>
            Skip
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Memory Match Game ───────────────────────────────────────────────────────
interface MemoryCard {
  id: number;
  pairId: number;
  content: string;
  type: "term" | "definition";
  flipped: boolean;
  matched: boolean;
}

function MemoryGame({
  pairs,
  subject: _subject,
  onBack,
}: { pairs: MemoryPair[]; subject: string; onBack: () => void }) {
  const [cards, setCards] = useState<MemoryCard[]>(() => buildCards(pairs));
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const flippedRef = useRef<number[]>([]);
  const lockRef = useRef(false);

  function buildCards(p: MemoryPair[]): MemoryCard[] {
    const deck: MemoryCard[] = [];
    p.forEach((pair, i) => {
      deck.push({
        id: i * 2,
        pairId: i,
        content: pair.term,
        type: "term",
        flipped: false,
        matched: false,
      });
      deck.push({
        id: i * 2 + 1,
        pairId: i,
        content: pair.definition,
        type: "definition",
        flipped: false,
        matched: false,
      });
    });
    return shuffleArray(deck);
  }

  function flipCard(id: number) {
    if (lockRef.current) return;
    setCards((prev) => {
      const card = prev.find((c) => c.id === id);
      if (!card || card.flipped || card.matched) return prev;
      const newCards = prev.map((c) =>
        c.id === id ? { ...c, flipped: true } : c,
      );
      const nowFlipped = newCards.filter((c) => c.flipped && !c.matched);
      if (nowFlipped.length === 2) {
        flippedRef.current = nowFlipped.map((c) => c.id);
        lockRef.current = true;
        setMoves((m) => m + 1);
        const [a, b] = nowFlipped;
        if (a.pairId === b.pairId) {
          // match
          setTimeout(() => {
            setCards((c) => {
              const updated = c.map((x) =>
                x.pairId === a.pairId
                  ? { ...x, matched: true, flipped: true }
                  : x,
              );
              if (updated.every((x) => x.matched)) setDone(true);
              return updated;
            });
            lockRef.current = false;
          }, 600);
        } else {
          // no match
          setTimeout(() => {
            setCards((c) =>
              c.map((x) =>
                flippedRef.current.includes(x.id)
                  ? { ...x, flipped: false }
                  : x,
              ),
            );
            lockRef.current = false;
          }, 1000);
        }
      }
      return newCards;
    });
  }

  function replay() {
    setCards(buildCards(pairs));
    setMoves(0);
    setDone(false);
    lockRef.current = false;
  }

  if (done) {
    const perfect = moves <= pairs.length;
    const score = perfect
      ? pairs.length
      : Math.max(0, pairs.length - Math.floor((moves - pairs.length) / 2));
    return (
      <ScoreScreen
        score={score}
        total={pairs.length}
        onReplay={replay}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground text-xs">Match all pairs!</span>
        <Badge variant="outline" className="text-xs">
          Moves: {moves}
        </Badge>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <button
            type="button"
            key={card.id}
            onClick={() => flipCard(card.id)}
            className={`aspect-square rounded-xl border text-center flex items-center justify-center p-1.5 transition-all duration-200 text-[10px] leading-tight font-medium ${
              card.matched
                ? "bg-green-50 border-green-300 text-green-700"
                : card.flipped
                  ? "bg-student-light border-student text-student"
                  : "bg-muted border-border text-transparent cursor-pointer hover:bg-muted/60"
            }`}
          >
            {card.flipped || card.matched ? card.content : "?"}
          </button>
        ))}
      </div>
      <p className="text-xs text-center text-muted-foreground">
        {cards.filter((c) => c.matched).length / 2} / {pairs.length} pairs
        matched
      </p>
    </div>
  );
}

// ─── True / False Game ───────────────────────────────────────────────────────
function TrueFalseGame({
  questions,
  subject: _subject,
  onBack,
}: { questions: TrueFalseQuestion[]; subject: string; onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  function replay() {
    setIdx(0);
    setAnswered(null);
    setScore(0);
    setDone(false);
  }

  function answer(val: boolean) {
    if (answered !== null) return;
    const correct = val === questions[idx].answer;
    if (correct) setScore((s) => s + 1);
    setAnswered(val);
    setTimeout(() => {
      const next = idx + 1;
      if (next >= questions.length) {
        setDone(true);
      } else {
        setIdx(next);
        setAnswered(null);
      }
    }, 1500);
  }

  if (done)
    return (
      <ScoreScreen
        score={score}
        total={questions.length}
        onReplay={replay}
        onBack={onBack}
      />
    );

  const q = questions[idx];
  const isCorrect = answered !== null && answered === q.answer;
  const isWrong = answered !== null && answered !== q.answer;

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {idx + 1} / {questions.length}
        </Badge>
        <span className="text-xs text-muted-foreground">Score: {score}</span>
      </div>

      <Card className="p-5 text-center">
        <p className="font-display font-bold text-base text-foreground leading-snug">
          {q.statement}
        </p>
      </Card>

      {answered !== null && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-semibold text-center ${
            isCorrect
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {isCorrect
            ? "✅ Correct!"
            : `❌ Wrong! The answer is ${q.answer ? "TRUE" : "FALSE"}.`}
          {q.explanation && (
            <p className="font-normal text-xs mt-1 opacity-80">
              {q.explanation}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => answer(true)}
          disabled={answered !== null}
          className={`rounded-xl py-5 font-display font-bold text-lg transition-all duration-150 border-2 ${
            answered === null
              ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
              : answered === true
                ? isCorrect
                  ? "bg-green-200 border-green-500 text-green-800"
                  : "bg-red-100 border-red-400 text-red-700"
                : "opacity-40 bg-muted border-border text-muted-foreground"
          }`}
        >
          ✔ TRUE
        </button>
        <button
          type="button"
          onClick={() => answer(false)}
          disabled={answered !== null}
          className={`rounded-xl py-5 font-display font-bold text-lg transition-all duration-150 border-2 ${
            answered === null
              ? "bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
              : answered === false
                ? isWrong
                  ? "bg-red-100 border-red-400 text-red-700"
                  : "bg-green-200 border-green-500 text-green-800"
                : "opacity-40 bg-muted border-border text-muted-foreground"
          }`}
        >
          ✘ FALSE
        </button>
      </div>
    </div>
  );
}
