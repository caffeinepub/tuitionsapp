import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
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
      "Access your subjects, track assignments, and view your grades all in one place.",
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
    description:
      "Manage your classes, create assignments, and track student progress effortlessly.",
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
      "Stay informed about your child's academic progress, grades, and upcoming sessions.",
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

  return (
    <div className="min-h-screen landing-bg flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <button
          type="button"
          className="flex items-center gap-2.5 cursor-pointer select-none bg-transparent border-0 p-0 outline-none"
          onClick={handleLogoClick}
        >
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-primary">
            TuitionsApp
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
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

        {/* Role Cards */}
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

        {/* Parent Reviews */}
        {reviews.length > 0 && (
          <section
            data-ocid="landing.reviews.section"
            className="w-full max-w-5xl mt-16"
          >
            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-2">
              What Parents Say
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-8">
              Real experiences from parents in our community
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((review, i) => (
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
                  </div>
                  {/* Text */}
                  <p className="text-sm text-foreground leading-relaxed flex-1">
                    "{review.reviewText}"
                  </p>
                  {/* Footer */}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-semibold text-parent">
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
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
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
        <h2 className="text-xl font-bold text-foreground mb-2">{role.label}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-5">
          {role.description}
        </p>

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
