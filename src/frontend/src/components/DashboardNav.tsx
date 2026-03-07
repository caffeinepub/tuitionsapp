import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";

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
            <Sparkles className="w-4 h-4 text-white" />
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
