import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/integrations/firebase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Sparkles, ShieldCheck, Heart, Flame } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Habitly" }] }),
  component: AuthPage,
});

const REMEMBER_KEY = "habitly-remember-email";

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) { setEmail(saved); setRemember(true); }
  }, []);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getFirebaseAuth();
    if (!auth) {
      toast.error("Could not start sign-in. Check Firebase config in web-config.ts or .env.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
        toast.success("Welcome aboard! ✨");
        navigate({ to: "/" });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        if (remember) localStorage.setItem(REMEMBER_KEY, email);
        else localStorage.removeItem(REMEMBER_KEY);
        toast.success("Welcome back ✨");
        navigate({ to: "/" });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    if (!isFirebaseConfigured() || !getFirebaseAuth()) {
      toast.error("Could not start sign-in. Check Firebase config in web-config.ts or .env.");
      return;
    }
    setBusy(true);
    try {
      const auth = getFirebaseAuth()!;
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success("Welcome back ✨");
      navigate({ to: "/" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10">
      {/* Floating orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 size-96 rounded-full opacity-60 blur-3xl"
             style={{ background: "radial-gradient(circle, oklch(0.7 0.22 295 / 0.35), transparent 70%)" }} />
        <div className="absolute -right-32 top-1/3 size-[28rem] rounded-full opacity-50 blur-3xl"
             style={{ background: "radial-gradient(circle, oklch(0.7 0.18 230 / 0.3), transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/3 size-80 rounded-full opacity-40 blur-3xl"
             style={{ background: "radial-gradient(circle, oklch(0.78 0.15 70 / 0.25), transparent 70%)" }} />
        <div className="absolute left-12 top-1/2 size-3 animate-pulse rounded-full bg-primary/60" />
        <div className="absolute right-24 top-24 size-2 animate-pulse rounded-full bg-[oklch(0.78_0.15_70)]" style={{ animationDelay: "0.4s" }} />
        <div className="absolute right-1/3 bottom-16 size-2.5 animate-pulse rounded-full bg-[oklch(0.7_0.18_230)]" style={{ animationDelay: "0.8s" }} />
      </div>

      <div className="relative grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:gap-14">
        {/* Hero side */}
        <div className="hidden flex-col justify-between rounded-[32px] p-10 text-white shadow-glow lg:flex"
             style={{ background: "var(--gradient-sidebar)" }}>
          <Link to="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl shadow-glow"
                 style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">Habitly</p>
              <p className="text-xs text-white/60">Your wellness OS</p>
            </div>
          </Link>

          <div className="space-y-5">
            <h2 className="font-[Poppins] text-4xl font-bold leading-tight tracking-tight">
              Build the <span className="text-gradient">future</span> you,<br/>one habit at a time.
            </h2>
            <p className="text-sm leading-relaxed text-white/70">
              Track habits, run with confidence, and unlock streaks, levels and badges that keep you coming back.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Flame, label: "Streaks", c: "oklch(0.78 0.18 30)" },
                { icon: Heart, label: "Wellness", c: "oklch(0.72 0.15 160)" },
                { icon: ShieldCheck, label: "Private", c: "oklch(0.7 0.18 230)" },
              ].map(({ icon: Icon, label, c }) => (
                <div key={label} className="rounded-2xl bg-white/5 p-3 text-center backdrop-blur-sm">
                  <div className="mx-auto flex size-9 items-center justify-center rounded-xl"
                       style={{ background: `color-mix(in oklab, ${c} 30%, transparent)` }}>
                    <Icon className="size-4" style={{ color: c }} />
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-white/80">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/40">
            "Small daily wins compound into a powerful life."
          </p>
        </div>

        {/* Form side */}
        <div className="mx-auto w-full max-w-md">
          <div className="text-center lg:hidden">
            <Link to="/" className="inline-flex size-14 items-center justify-center rounded-2xl text-white shadow-glow"
                  style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="size-6" />
            </Link>
          </div>

          <div className="mt-6 lg:mt-2">
            <h1 className="font-[Poppins] text-3xl font-bold tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to continue your streak ✨"
                : "Start building better habits today 🚀"}
            </p>
          </div>

          <div className="mt-6 rounded-3xl glass p-6 shadow-soft animate-float-in">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full bg-card/80 transition-all hover:-translate-y-0.5 hover:shadow-soft"
              onClick={google}
              disabled={busy}
            >
              <svg className="mr-2 size-4" viewBox="0 0 24 24" aria-hidden>
                <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.4-1.7 4.1-5.4 4.1-3.3 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.6 3.5 14.5 2.5 12 2.5 6.7 2.5 2.5 6.7 2.5 12s4.2 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> or with email <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={submit} className="space-y-3.5">
              {mode === "signup" && (
                <Field icon={UserIcon} label="Name" id="name">
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required
                         className="h-12 rounded-2xl border-border/60 bg-card/60 pl-10" />
                </Field>
              )}
              <Field icon={Mail} label="Email" id="email">
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                       className="h-12 rounded-2xl border-border/60 bg-card/60 pl-10" />
              </Field>
              <Field icon={Lock} label="Password" id="password">
                <Input id="password" type={showPwd ? "text" : "password"} minLength={6} value={password}
                       onChange={(e) => setPassword(e.target.value)} required
                       className="h-12 rounded-2xl border-border/60 bg-card/60 pl-10 pr-10" />
                <button type="button" onClick={() => setShowPwd((s) => !s)}
                        className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                        aria-label={showPwd ? "Hide password" : "Show password"}>
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </Field>

              {mode === "signin" && (
                <label className="flex cursor-pointer items-center gap-2 pt-1 text-sm text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="size-4 rounded border-border accent-[oklch(0.55_0.2_295)]"
                  />
                  Remember me
                </label>
              )}

              <Button type="submit" className="glow-btn h-12 w-full rounded-full text-sm font-semibold" disabled={busy}>
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "New here?" : "Have an account?"}{" "}
              <button type="button" className="font-semibold text-primary hover:underline"
                      onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
                {mode === "signin" ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, label, id, children,
}: { icon: React.ComponentType<{ className?: string }>; label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="relative space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Icon className="pointer-events-none absolute left-3 top-9 size-4 text-muted-foreground" />
      {children}
    </div>
  );
}
