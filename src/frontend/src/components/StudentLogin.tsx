import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, GraduationCap, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { StudentUser } from "../App";
import {
  getStudentUsers,
  isStudentBanned,
  resetStudentPassword,
} from "../utils/studentStorage";
import { AuthLayout } from "./AuthLayout";

type Props = {
  onLogin: (student: StudentUser) => void;
  onRegister: () => void;
  onBack: () => void;
};

type Mode = "login" | "forgot";

export function StudentLogin({ onLogin, onRegister, onBack }: Props) {
  const [mode, setMode] = useState<Mode>("login");

  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot-password state
  const [fpUsername, setFpUsername] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const users = getStudentUsers();
      const user = users.find(
        (u) =>
          u.username.toLowerCase() === username.trim().toLowerCase() &&
          u.password === password,
      );

      if (user) {
        if (isStudentBanned(user.username)) {
          setError("Your account has been banned. Please contact support.");
          setLoading(false);
          return;
        }
        toast.success(`Welcome back, ${user.name}!`);
        onLogin({ name: user.name, username: user.username });
      } else {
        setError("Invalid username or password. Please try again.");
        setLoading(false);
      }
    }, 500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFpError(null);

    if (!fpUsername.trim()) {
      setFpError("Please enter your username.");
      return;
    }
    if (fpNewPassword.length < 6) {
      setFpError("New password must be at least 6 characters.");
      return;
    }
    if (fpNewPassword !== fpConfirmPassword) {
      setFpError("Passwords do not match.");
      return;
    }

    setFpLoading(true);
    setTimeout(() => {
      const result = resetStudentPassword(fpUsername, fpNewPassword);
      setFpLoading(false);
      if (result.success) {
        toast.success(
          "Password reset! You can now sign in with your new password.",
        );
        // Reset fields and return to login
        setFpUsername("");
        setFpNewPassword("");
        setFpConfirmPassword("");
        setMode("login");
      } else {
        setFpError(result.message);
      }
    }, 500);
  };

  const switchToForgot = () => {
    setError(null);
    setFpError(null);
    setMode("forgot");
  };

  const switchToLogin = () => {
    setFpError(null);
    setMode("login");
  };

  if (mode === "forgot") {
    return (
      <AuthLayout
        onBack={switchToLogin}
        roleLabel="Student"
        roleColor="student"
      >
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-student-light flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-student" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Reset Password
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your username and choose a new password
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fp-username" className="text-sm font-medium">
              Username
            </Label>
            <Input
              id="fp-username"
              data-ocid="student.forgot.username.input"
              type="text"
              placeholder="Enter your username"
              value={fpUsername}
              onChange={(e) => setFpUsername(e.target.value)}
              autoComplete="username"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fp-new-password" className="text-sm font-medium">
              New Password
            </Label>
            <Input
              id="fp-new-password"
              data-ocid="student.forgot.new_password.input"
              type="password"
              placeholder="At least 6 characters"
              value={fpNewPassword}
              onChange={(e) => setFpNewPassword(e.target.value)}
              autoComplete="new-password"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="fp-confirm-password"
              className="text-sm font-medium"
            >
              Confirm New Password
            </Label>
            <Input
              id="fp-confirm-password"
              data-ocid="student.forgot.confirm_password.input"
              type="password"
              placeholder="Re-enter new password"
              value={fpConfirmPassword}
              onChange={(e) => setFpConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="h-10"
            />
          </div>

          {fpError && (
            <div
              data-ocid="student.forgot.error_state"
              className="flex items-center gap-2 text-destructive text-sm bg-destructive/8 rounded-lg px-3 py-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {fpError}
            </div>
          )}

          <Button
            data-ocid="student.forgot.submit_button"
            type="submit"
            className="w-full bg-student hover:bg-student/90 text-white font-semibold h-10 mt-2"
            disabled={fpLoading}
          >
            {fpLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resetting…
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Remembered your password?{" "}
            <button
              data-ocid="student.forgot.back_to_login.link"
              onClick={switchToLogin}
              className="text-student font-semibold hover:underline underline-offset-2 transition-colors"
              type="button"
            >
              Back to Sign In
            </button>
          </p>
        </div>
      </AuthLayout>
    );
  }

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

      <form onSubmit={handleLoginSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <button
              data-ocid="student.forgot_password.link"
              type="button"
              onClick={switchToForgot}
              className="text-xs text-student font-medium hover:underline underline-offset-2 transition-colors"
            >
              Forgot password?
            </button>
          </div>
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
