import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

type Props = {
  userRole: "Student" | "Teacher" | "Parent";
  userName?: string;
  onLogout: () => void;
  headerClass: string;
};

const roleBadgeClass = {
  Student: "bg-white/20 text-white border-white/30",
  Teacher: "bg-white/20 text-white border-white/30",
  Parent: "bg-white/20 text-white border-white/30",
};

/** Premium TuitionsApp logo mark — graduation cap with sparkle (white variant) */
function LogoMarkWhite() {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Mortarboard flat top */}
      <polygon points="18,10 33,17 18,24 3,17" fill="white" opacity="0.95" />
      {/* Cap body / base */}
      <path
        d="M11 19.5 L11 26 Q18 30 25 26 L25 19.5"
        stroke="white"
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
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Tassel bob */}
      <circle cx="33" cy="24.5" r="1.8" fill="white" />
      {/* 4-pointed sparkle above cap */}
      <g transform="translate(18, 5.5)">
        <path d="M0 -4.2 Q0.7 -1.5 0 0 Q-0.7 -1.5 0 -4.2Z" fill="white" />
        <path d="M0 4.2 Q0.7 1.5 0 0 Q-0.7 1.5 0 4.2Z" fill="white" />
        <path d="M-4.2 0 Q-1.5 0.7 0 0 Q-1.5 -0.7 -4.2 0Z" fill="white" />
        <path d="M4.2 0 Q1.5 0.7 0 0 Q1.5 -0.7 4.2 0Z" fill="white" />
      </g>
    </svg>
  );
}

export function DashboardNav({
  userRole,
  userName,
  onLogout,
  headerClass,
}: Props) {
  return (
    <header className={`${headerClass} px-4 sm:px-6 py-4`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <LogoMarkWhite />
          </div>
          <span className="font-display font-bold text-lg text-white">
            TuitionsApp
          </span>
          <Badge
            variant="outline"
            className={`hidden sm:inline-flex text-xs font-semibold border ${roleBadgeClass[userRole]}`}
          >
            {userRole}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <span className="hidden sm:block text-sm text-white/80 font-medium">
              {userName}
            </span>
          )}
          <Button
            data-ocid="nav.logout.button"
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-white/80 hover:text-white hover:bg-white/20 gap-1.5 font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
