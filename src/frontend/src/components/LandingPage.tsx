import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import type { AppView } from "../App";
import { type Review, getReviews } from "../utils/reviewStorage";

type Props = {
  onNavigate: (view: AppView) => void;
};

const roles = [
  {
    key: "student" as const,
    icon: GraduationCap,
    label: "Student",
    description:
      "Everything you need to learn, grow, and succeed — all in one place.",
    features: [
      "Search and book sessions with teachers",
      "View and complete assignments",
      "Real-time chat with your teacher",
      "Track your grades and progress",
      "Take AI-powered quizzes and tests",
      "Play educational Learning Games",
      "Join classes via class code",
      "Compete on the student Leaderboard",
      "Ask your AI Doubt Bot anything",
    ],
    cta: "Login as Student",
    ocid: "role.student.button",
    colorBar: "bg-student",
    iconBg: "bg-student-light",
    iconColor: "text-student",
    btnClass: "bg-student hover:bg-student/90 text-white",
    view: "student-login" as AppView,
  },
  {
    key: "teacher" as const,
    icon: BookOpen,
    label: "Teacher",
    description: "Powerful tools to teach, manage, and inspire your students.",
    features: [
      "Create and assign work to students",
      "AI-powered Quiz & Test Builder",
      "Grade students and track results",
      "Real-time chat with students",
      "Direct private chat with parents",
      "Schedule and manage sessions",
      "Create classes with join codes",
      "Post class announcements",
      "Upload profile picture and awards",
      "Free Time Robot AI assistant",
      "Support portal and report tools",
    ],
    cta: "Login as Teacher",
    ocid: "role.teacher.button",
    colorBar: "bg-teacher",
    iconBg: "bg-teacher-light",
    iconColor: "text-teacher",
    btnClass: "bg-teacher hover:bg-teacher/90 text-white",
    view: "teacher-login" as AppView,
  },
  {
    key: "parent" as const,
    icon: Users,
    label: "Parent",
    description:
      "Stay connected and confident about your child's education journey.",
    features: [
      "Link to your child's account securely",
      "View real grades and progress",
      "See all booked sessions",
      "Real-time messaging with teachers",
      "Direct private chat with teachers",
      "View teacher profiles and awards",
      "Leave public reviews",
      "Support portal and report tools",
    ],
    cta: "Login as Parent",
    ocid: "role.parent.button",
    colorBar: "bg-parent",
    iconBg: "bg-parent-light",
    iconColor: "text-parent",
    btnClass: "bg-parent hover:bg-parent/90 text-white",
    view: "parent-login" as AppView,
  },
] as const;

function relativeDate(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
}

/** Premium Tuition Skill logo mark — graduation cap with sparkle */
function LogoMark({
  size = 36,
  color = "#1B2B50",
}: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Mortarboard flat top */}
      <polygon points="18,10 33,17 18,24 3,17" fill={color} opacity="0.95" />
      {/* Cap body / base */}
      <path
        d="M11 19.5 L11 26 Q18 30 25 26 L25 19.5"
        stroke={color}
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Tassel stem */}
      <line
        x1="33"
        y1="17"
        x2="33"
        y2="23"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Tassel bob */}
      <circle cx="33" cy="24.5" r="1.8" fill={color} />
      {/* 4-pointed sparkle above cap */}
      <g transform="translate(18, 5.5)">
        <path
          d="M0,-4 C0,-1.5 0,-1.5 0,0 C0,-1.5 0,-1.5 0,-4 Z"
          stroke={color}
          strokeWidth="0"
          fill={color}
        />
        {/* sparkle: 4 petals */}
        <path d="M0 -4.2 Q0.7 -1.5 0 0 Q-0.7 -1.5 0 -4.2Z" fill={color} />
        <path d="M0 4.2 Q0.7 1.5 0 0 Q-0.7 1.5 0 4.2Z" fill={color} />
        <path d="M-4.2 0 Q-1.5 0.7 0 0 Q-1.5 -0.7 -4.2 0Z" fill={color} />
        <path d="M4.2 0 Q1.5 0.7 0 0 Q1.5 -0.7 4.2 0Z" fill={color} />
      </g>
    </svg>
  );
}

export function LandingPage({ onNavigate }: Props) {
  const [reviews] = useState<Review[]>(() => getReviews());
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const logoClickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleLogoClick() {
    const nextCount = logoClickCount + 1;
    if (nextCount >= 5) {
      setShowAdmin(true);
      setLogoClickCount(0);
      if (logoClickTimeout.current) clearTimeout(logoClickTimeout.current);
      return;
    }
    setLogoClickCount(nextCount);
    if (logoClickTimeout.current) clearTimeout(logoClickTimeout.current);
    logoClickTimeout.current = setTimeout(() => {
      setLogoClickCount(0);
    }, 2000);
  }

  const parentReviews = reviews.filter(
    (r) => !r.reviewerType || r.reviewerType === "parent",
  );
  const studentReviews = reviews.filter((r) => r.reviewerType === "student");
  const allCommunityReviews = [...studentReviews, ...parentReviews];

  return (
    <div className="min-h-screen landing-bg flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <button
          type="button"
          className="flex items-center gap-2.5 cursor-pointer select-none bg-transparent border-0 p-0 outline-none"
          onClick={handleLogoClick}
        >
          <LogoMark size={36} color="#1B2B50" />
          <span
            className="font-display font-bold text-xl"
            style={{ color: "#1B2B50" }}
          >
            Tuition Skill
          </span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground font-sans hidden sm:block">
            Your all-in-one learning platform
          </span>
          {showAdmin && (
            <Button
              data-ocid="landing.admin.button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("admin-login")}
              className="gap-1.5 text-muted-foreground hover:text-foreground text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </Button>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center px-4 py-12">
        {/* Decorative circles */}
        <div className="relative w-full max-w-6xl mb-12">
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse, oklch(0.67 0.19 28) 0%, transparent 70%)",
            }}
          />
        </div>

        <div
          className="text-center mb-14 animate-fade-in-up"
          style={{ animationDelay: "0ms" }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/8 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Premium Tutoring Platform
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-primary leading-tight mb-4">
            Learning that
            <br />
            <span className="italic" style={{ color: "oklch(var(--student))" }}>
              elevates
            </span>{" "}
            everyone
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Connect students, teachers, and parents in a seamless educational
            ecosystem designed for modern learning.
          </p>
        </div>

        {/* Role Cards with Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
          {roles.map((role, i) => (
            <RoleCard
              key={role.key}
              role={role}
              onNavigate={onNavigate}
              delay={`${(i + 1) * 100}ms`}
            />
          ))}
        </div>

        {/* Community Reviews (Students + Parents) */}
        {allCommunityReviews.length > 0 && (
          <section
            data-ocid="landing.reviews.section"
            className="w-full max-w-5xl mt-20"
          >
            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-2">
              What Our Community Says
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-8">
              Real experiences from students and parents
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCommunityReviews.map((review, i) => (
                <div
                  key={review.id}
                  data-ocid={`landing.reviews.item.${i + 1}`}
                  className="bg-card border border-border/60 rounded-2xl shadow-card p-5 flex flex-col gap-3"
                >
                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-4 h-4"
                        fill={star <= review.rating ? "#f59e0b" : "transparent"}
                        stroke={star <= review.rating ? "#f59e0b" : "#d1d5db"}
                      />
                    ))}
                    {review.reviewerType === "student" && (
                      <span className="ml-2 text-xs bg-student/10 text-student font-semibold px-2 py-0.5 rounded-full">
                        Student
                      </span>
                    )}
                    {(!review.reviewerType ||
                      review.reviewerType === "parent") && (
                      <span className="ml-2 text-xs bg-parent/10 text-parent font-semibold px-2 py-0.5 rounded-full">
                        Parent
                      </span>
                    )}
                  </div>
                  {/* Text */}
                  <p className="text-sm text-foreground leading-relaxed flex-1">
                    &ldquo;{review.reviewText}&rdquo;
                  </p>
                  {/* Footer */}
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`text-xs font-semibold ${
                        review.reviewerType === "student"
                          ? "text-student"
                          : "text-parent"
                      }`}
                    >
                      {review.parentName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {relativeDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* Speech / Mission Section */}
        <section
          data-ocid="landing.speech.section"
          className="w-full max-w-4xl mt-12 mb-4"
        >
          <div className="bg-card border border-border/60 rounded-3xl shadow-card p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Decorative quote mark */}
            <div
              className="absolute top-6 left-8 text-8xl font-display font-bold opacity-5 select-none pointer-events-none leading-none"
              style={{ color: "oklch(var(--primary))" }}
            >
              &ldquo;
            </div>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-widest">
                Our Mission
              </span>
            </div>
            <blockquote className="space-y-5 relative z-10">
              <p className="text-foreground text-lg sm:text-xl leading-relaxed font-medium">
                Every student deserves a champion. But finding the right tutor
                &mdash; at the right time, for the right price &mdash; has
                always been harder than it should be.{" "}
                <span
                  className="font-bold italic"
                  style={{ color: "oklch(var(--primary))" }}
                >
                  Tuition Skill was built to change that.
                </span>
              </p>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                When a student connects with the right teacher, something
                remarkable happens. Confidence grows. Results follow. Our
                platform makes that connection possible for every learner, at
                every stage of life &mdash; from primary school to university.
              </p>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                We are more than a marketplace. We are a community where
                students thrive, teachers flourish, and parents feel confident.{" "}
                <span
                  className="font-semibold"
                  style={{ color: "oklch(var(--primary))" }}
                >
                  Tuition Skill is here to make sure no one gets left behind in
                  education.
                </span>
              </p>
            </blockquote>
            <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-border/40">
              <div className="text-center">
                <p className="font-display font-bold text-2xl text-primary">
                  Students
                </p>
                <p className="text-xs text-muted-foreground">Empowered daily</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="font-display font-bold text-2xl text-teacher">
                  Teachers
                </p>
                <p className="text-xs text-muted-foreground">Flourishing</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="font-display font-bold text-2xl text-parent">
                  Parents
                </p>
                <p className="text-xs text-muted-foreground">Always informed</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()}. Built with love using{" "}
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

function RoleCard({
  role,
  onNavigate,
  delay,
}: {
  role: (typeof roles)[number];
  onNavigate: (view: AppView) => void;
  delay: string;
}) {
  const Icon = role.icon;
  return (
    <div
      className="animate-fade-in-up card-lift bg-card rounded-2xl shadow-card overflow-hidden flex flex-col border border-border/60"
      style={{ animationDelay: delay }}
    >
      {/* Top color bar */}
      <div className={`h-1.5 w-full ${role.colorBar}`} />

      <div className="p-6 flex flex-col flex-1">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl ${role.iconBg} flex items-center justify-center mb-4`}
        >
          <Icon className={`w-6 h-6 ${role.iconColor}`} />
        </div>

        {/* Content */}
        <h2 className="text-xl font-bold text-foreground mb-1">{role.label}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {role.description}
        </p>

        {/* Feature list */}
        <ul className="space-y-1.5 mb-5 flex-1">
          {role.features.map((feat) => (
            <li key={feat} className="flex items-start gap-2 text-sm">
              <CheckCircle
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${role.iconColor}`}
              />
              <span className="text-foreground/80">{feat}</span>
            </li>
          ))}
        </ul>

        {/* Button */}
        <Button
          data-ocid={role.ocid}
          className={`w-full font-semibold gap-2 ${role.btnClass}`}
          onClick={() => onNavigate(role.view)}
        >
          {role.cta}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
