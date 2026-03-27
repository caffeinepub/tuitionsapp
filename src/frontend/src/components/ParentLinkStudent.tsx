import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, Search, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActorWithConfig } from "../config";
import {
  getStudentUsers,
  saveParentLink,
  verifyStudentCode,
} from "../utils/studentStorage";
import { AuthLayout } from "./AuthLayout";

type Props = {
  parentPrincipal: string;
  onLinked: (studentUsername: string, studentName: string) => void;
  onBack: () => void;
};

export function ParentLinkStudent({
  parentPrincipal,
  onLinked,
  onBack,
}: Props) {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !code.trim()) {
      toast.error("Please enter both the student username and the code.");
      return;
    }

    setIsLoading(true);

    try {
      const lookupUsername = username.trim().toLowerCase();

      // First check localStorage (same device)
      const students = getStudentUsers();
      const localStudent = students.find(
        (s) => s.username.toLowerCase() === lookupUsername,
      );

      let studentName = localStudent?.name ?? "";
      let studentUsername = localStudent?.username ?? lookupUsername;
      let foundStudent = !!localStudent;

      // If not found locally, check the backend canister (cross-device support)
      if (!foundStudent) {
        try {
          const actor = (await createActorWithConfig()) as any;
          const result = await actor.getStudentPublicByUsername(lookupUsername);
          // Motoko ?(Text, Text) comes back as [] or [[username, name]]
          const arr = result as unknown[];
          if (arr && arr.length > 0) {
            const tuple = arr[0] as [string, string];
            studentUsername = tuple[0];
            studentName = tuple[1];
            foundStudent = true;
          }
        } catch {
          // backend unreachable — fall through to error below
        }
      }

      if (!foundStudent) {
        toast.error(
          "No student found with that username. Make sure the student has logged in at least once.",
        );
        setIsLoading(false);
        return;
      }

      // Verify code — check localStorage first, then backend
      let valid = verifyStudentCode(lookupUsername, code.trim());
      if (!valid) {
        try {
          const actor = (await createActorWithConfig()) as any;
          valid = await actor.checkVerificationCode(
            lookupUsername,
            code.trim(),
          );
        } catch {
          valid = false;
        }
      }

      if (!valid) {
        toast.error(
          "Verification code is incorrect. Ask your child for their code from their dashboard.",
        );
        setIsLoading(false);
        return;
      }

      saveParentLink(parentPrincipal, studentUsername, studentName);
      toast.success(`Linked to ${studentName}'s account!`);
      onLinked(studentUsername, studentName);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout onBack={onBack} roleLabel="Parent" roleColor="parent">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-parent-light flex items-center justify-center">
            <Users className="w-5 h-5 text-parent" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Find Your Student
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your child's details to link their account
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleLink} className="space-y-5">
        {/* Info box */}
        <div className="bg-secondary/60 rounded-xl p-4 border border-border/40">
          <div className="flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-parent mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                How to get the code
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ask your child to log in to their student account and share the
                6-digit "Parent Access Code" shown on their dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <Label htmlFor="student-username" className="text-sm font-semibold">
            Student Username
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="student-username"
              data-ocid="parent.link.username.input"
              type="text"
              placeholder="e.g. alex"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-9"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Verification code */}
        <div className="space-y-1.5">
          <Label htmlFor="verification-code" className="text-sm font-semibold">
            Verification Code
          </Label>
          <Input
            id="verification-code"
            data-ocid="parent.link.code.input"
            type="text"
            inputMode="numeric"
            placeholder="6-digit code from student's dashboard"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            maxLength={6}
            autoComplete="off"
          />
        </div>

        <Button
          data-ocid="parent.link.submit.button"
          type="submit"
          disabled={isLoading || !username.trim() || code.length !== 6}
          className="w-full bg-parent hover:bg-parent/90 text-white font-semibold h-11 text-base gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              Link Student Account
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
