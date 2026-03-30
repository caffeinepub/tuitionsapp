import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onBack: () => void;
  roleLabel: string;
  roleColor: "student" | "teacher" | "parent";
};

const colorMap = {
  student: {
    dot: "bg-student",
    badge: "bg-student-light text-student border-student/30",
    accent: "text-student",
  },
  teacher: {
    dot: "bg-teacher",
    badge: "bg-teacher-light text-teacher border-teacher/30",
    accent: "text-teacher",
  },
  parent: {
    dot: "bg-parent",
    badge: "bg-parent-light text-parent border-parent/30",
    accent: "text-parent",
  },
};

export function AuthLayout({ children, onBack, roleLabel, roleColor }: Props) {
  const colors = colorMap[roleColor];

  return (
    <div className="min-h-screen landing-bg flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-primary">
            Tuition Skill
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </header>

      {/* Form area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-6 text-center">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest border rounded-full px-3 py-1 mb-4 ${colors.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              {roleLabel} Portal
            </span>
          </div>
          <div className="bg-card rounded-2xl shadow-card border border-border/60 overflow-hidden">
            <div className={`h-1.5 w-full bg-${roleColor}`} />
            <div className="p-8">{children}</div>
          </div>
        </div>
      </main>

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
