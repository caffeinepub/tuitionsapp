import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, GraduationCap, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { saveStudentUser } from "../utils/studentStorage";
import { AuthLayout } from "./AuthLayout";

type Props = {
  onRegistered: () => void;
  onBack: () => void;
};

export function StudentRegister({ onRegistered, onBack }: Props) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !username.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = saveStudentUser({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password,
      });
      if (result.success) {
        toast.success(
          "Account created! Please log in with your new credentials.",
        );
        onRegistered();
      } else {
        setError(result.message);
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
              Create Account
            </h1>
            <p className="text-sm text-muted-foreground">
              Join as a student today
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="reg-name" className="text-sm font-medium">
            Full Name
          </Label>
          <Input
            id="reg-name"
            data-ocid="student.register.name.input"
            type="text"
            placeholder="e.g. Jamie Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-username" className="text-sm font-medium">
            Username
          </Label>
          <Input
            id="reg-username"
            data-ocid="student.register.username.input"
            type="text"
            placeholder="Choose a unique username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-password" className="text-sm font-medium">
            Password
          </Label>
          <Input
            id="reg-password"
            data-ocid="student.register.password.input"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="h-10"
          />
        </div>

        {error && (
          <div
            data-ocid="student.register.error_state"
            className="flex items-center gap-2 text-destructive text-sm bg-destructive/8 rounded-lg px-3 py-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <Button
          data-ocid="student.register.submit_button"
          type="submit"
          className="w-full bg-student hover:bg-student/90 text-white font-semibold h-10 mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={onBack}
            className="text-student font-semibold hover:underline underline-offset-2 transition-colors"
            type="button"
          >
            Sign in
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
