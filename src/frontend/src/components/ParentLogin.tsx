import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { HelpCircle, Loader2, Shield, Users } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { AuthLayout } from "./AuthLayout";

type Props = {
  onBack: () => void;
  onLoggedIn: (principal: string) => void;
};

export function ParentLogin({ onBack, onLoggedIn }: Props) {
  const {
    login,
    isLoggingIn,
    isLoginSuccess,
    isInitializing,
    isLoginError,
    loginError,
    identity,
  } = useInternetIdentity();

  useEffect(() => {
    if (isLoginSuccess && identity) {
      const principal = identity.getPrincipal().toText();
      toast.success("Authenticated with Internet Identity!");
      onLoggedIn(principal);
    }
  }, [isLoginSuccess, identity, onLoggedIn]);

  // If the user is already authenticated (prior session still valid), treat it as success
  useEffect(() => {
    if (isLoginError && loginError) {
      if (loginError.message === "User is already authenticated" && identity) {
        const principal = identity.getPrincipal().toText();
        toast.success("Authenticated with Internet Identity!");
        onLoggedIn(principal);
      } else {
        toast.error(loginError.message || "Login failed. Please try again.");
      }
    }
  }, [isLoginError, loginError, identity, onLoggedIn]);

  return (
    <AuthLayout onBack={onBack} roleLabel="Parent" roleColor="parent">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-parent-light flex items-center justify-center">
            <Users className="w-5 h-5 text-parent" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Parent Login
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor your child's progress
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Info box */}
        <div className="bg-secondary/60 rounded-xl p-4 border border-border/40">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-parent mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                Secure Authentication
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Parent accounts use Internet Identity for secure,
                privacy-preserving authentication. Stay connected to your
                child's education safely.
              </p>
            </div>
          </div>
        </div>

        <Button
          data-ocid="parent.login.button"
          onClick={() => {
            // If already authenticated, skip re-login and proceed directly
            if (identity && !identity.getPrincipal().isAnonymous()) {
              const principal = identity.getPrincipal().toText();
              toast.success("Authenticated with Internet Identity!");
              onLoggedIn(principal);
            } else {
              login();
            }
          }}
          disabled={isLoggingIn || isInitializing}
          className="w-full bg-parent hover:bg-parent/90 text-white font-semibold h-11 text-base gap-2"
        >
          {isLoggingIn || isInitializing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isInitializing ? "Initializing…" : "Authenticating…"}
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Login with Internet Identity
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground leading-relaxed">
          Internet Identity provides secure, anonymous authentication on the
          Internet Computer network.
        </p>

        {/* Forgot / Recovery */}
        <div className="text-center">
          <Dialog>
            <DialogTrigger asChild>
              <button
                data-ocid="parent.forgot_password.button"
                className="text-xs text-parent hover:underline flex items-center gap-1 mx-auto"
                type="button"
              >
                <HelpCircle className="w-3 h-3" />
                Forgot / Lost access to Internet Identity?
              </button>
            </DialogTrigger>
            <DialogContent data-ocid="parent.forgot_password.dialog">
              <DialogHeader>
                <DialogTitle>Recover Internet Identity Access</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Internet Identity uses cryptographic keys instead of
                  passwords. To regain access, try one of these options:
                </p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    <span className="font-medium text-foreground">
                      Use a recovery phrase
                    </span>{" "}
                    -- if you saved a recovery phrase when setting up your
                    identity, visit{" "}
                    <a
                      href="https://identity.ic0.app"
                      target="_blank"
                      rel="noreferrer"
                      className="text-parent underline"
                    >
                      identity.ic0.app
                    </a>{" "}
                    and choose "Lost Access".
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Use another registered device
                    </span>{" "}
                    -- log in from a device (phone, tablet, other computer) that
                    you previously linked to your Internet Identity.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Use a recovery device
                    </span>{" "}
                    -- if you added a hardware security key as a recovery
                    device, plug it in and use it to authenticate.
                  </li>
                </ol>
                <p className="text-xs">
                  If you have no recovery options available, you will need to
                  create a new Internet Identity and re-link your student.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AuthLayout>
  );
}
