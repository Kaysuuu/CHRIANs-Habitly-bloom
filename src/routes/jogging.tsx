import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Footprints, Pause, Play, Save, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHabits, todayKey } from "@/lib/habits-store";
import { toast } from "sonner";

export const Route = createFileRoute("/jogging")({
  head: () => ({ meta: [{ title: "Jogging — Habitly" }] }),
  component: Jogging,
});

const ClientJog = lazy(() => import("@/components/app/jog-panel").then((m) => ({ default: m.JogPanel })));

function Jogging() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span
          className="flex size-12 items-center justify-center rounded-2xl text-white shadow-glow"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Footprints className="size-6" />
        </span>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Jogging tracker</h1>
          <p className="text-muted-foreground">Real-time GPS — distance, route, history.</p>
        </div>
      </div>
      {mounted ? (
        <Suspense fallback={<div className="h-[480px] rounded-3xl glass animate-pulse" />}>
          <ClientJog />
        </Suspense>
      ) : (
        <div className="h-[480px] rounded-3xl glass animate-pulse" />
      )}
    </div>
  );
}

// Re-export to satisfy lazy import via separate file path
export { };
