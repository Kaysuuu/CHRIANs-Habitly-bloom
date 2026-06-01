import { useEffect, useState } from "react";
import { useRewards, BADGES } from "@/lib/rewards";
import { celebrateBig } from "@/lib/celebrate";

type Event =
  | { kind: "level"; level: number }
  | { kind: "badge"; id: string };

let queue: Event[] = [];
let listener: ((q: Event[]) => void) | null = null;

export function pushReward(e: Event) {
  queue = [...queue, e];
  listener?.(queue);
}

export function LevelUpModal() {
  const [current, setCurrent] = useState<Event | null>(null);

  useEffect(() => {
    listener = (q) => {
      if (!current && q.length) {
        setCurrent(q[0]);
        queue = q.slice(1);
      }
    };
    if (queue.length && !current) {
      setCurrent(queue[0]);
      queue = queue.slice(1);
    }
    return () => { listener = null; };
  }, [current]);

  useEffect(() => {
    if (current) celebrateBig();
  }, [current]);

  if (!current) return null;

  const badge = current.kind === "badge" ? BADGES.find((b) => b.id === current.id) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={() => { setCurrent(null); setTimeout(() => listener?.(queue), 50); }}
      />
      <div className="relative w-full max-w-sm rounded-3xl glass-strong p-8 text-center shadow-glow animate-in zoom-in-95 duration-300">
        <div
          className="mx-auto flex size-24 items-center justify-center rounded-full text-5xl shadow-glow pulse-ring"
          style={{ background: "var(--gradient-primary)" }}
        >
          {current.kind === "level" ? "⭐" : badge?.emoji}
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-gradient">
          {current.kind === "level" ? `Level ${current.level}!` : badge?.name}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {current.kind === "level"
            ? "You've leveled up. Keep the momentum going!"
            : badge?.desc}
        </p>
        <button
          onClick={() => { setCurrent(null); setTimeout(() => listener?.(queue), 50); }}
          className="glow-btn mt-6 w-full rounded-full px-6 py-3 text-sm font-semibold"
        >
          Awesome
        </button>
      </div>
    </div>
  );
}
