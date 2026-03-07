import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, GraduationCap, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { StudentUser } from "../App";
import { getStudentUsers } from "../utils/studentStorage";
import { AuthLayout } from "./AuthLayout";

type Props = {
  onLogin: (student: StudentUser) => void;
  onRegister: () => void;
  onBack: () => void;
};

export function StudentLogin({ onLogin, onRegister, onBack }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    // Simulate async auth
    setTimeout(() => {
      const users = getStudentUsers();
      const user = users.find(
        (u) => u.username === username.trim() && u.password === password,
      );

      if (user) {
        toast.success(`Welcome back, ${user.name}!`);
        onLogin({ name: user.name, username: user.username });
      } else {
        setError("Invalid username or password. Please try again.");
        setLoading(false);
      }
    }, 500);
  };

  return (
    <AuthLayout onBack={onBack} roleLabel="Student" roleColor="student">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-student-light flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-student" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Student Login
            </h1>
            <p className="text-sm text-muted-foreground">
              Access your learning dashboard
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-sm font-medium">
            Username
          </Label>
          <Input
            id="username"
            data-ocid="student.username.input"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <Input
            id="password"
            data-ocid="student.password.input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="h-10"
          />
        </div>

        {error && (
          <div
            data-ocid="student.login.error_state"
            className="flex items-center gap-2 text-destructive text-sm bg-destructive/8 rounded-lg px-3 py-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <Button
          data-ocid="student.login.submit_button"
          type="submit"
          className="w-full bg-student hover:bg-student/90 text-white font-semibold h-10 mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button
            data-ocid="student.register.link"
            onClick={onRegister}
            className="text-student font-semibold hover:underline underline-offset-2 transition-colors"
            type="button"
          >
            Register here
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
