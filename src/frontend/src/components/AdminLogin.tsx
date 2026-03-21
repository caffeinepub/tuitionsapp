import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { adminLogin } from "../utils/adminStorage";

type Props = {
  onLoggedIn: () => void;
  onBack: () => void;
};

export function AdminLogin({ onLoggedIn, onBack }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password.trim()) {
      setError("Please enter the admin password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = adminLogin(password);
      if (ok) {
        onLoggedIn();
      } else {
        setError("Incorrect password. Please try again.");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen landing-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Back button */}
        <button
          data-ocid="admin.login.back_button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="bg-card border border-border/60 rounded-2xl shadow-card p-8">
          {/* Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md mb-4">
              <ShieldCheck className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Admin Panel
            </h1>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              Enter your admin password to access the control panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-sm font-medium">
                Admin Password
              </Label>
              <Input
                id="admin-password"
                data-ocid="admin.login.input"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-10"
                autoFocus
              />
            </div>

            {error && (
              <div
                data-ocid="admin.login.error_state"
                className="flex items-center gap-2 text-destructive text-sm bg-destructive/8 rounded-lg px-3 py-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              data-ocid="admin.login.submit_button"
              type="submit"
              className="w-full font-semibold h-10"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In to Admin Panel"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
