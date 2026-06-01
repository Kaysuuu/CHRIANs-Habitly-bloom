import { useEffect, useRef, useState } from "react";
import { Pause, Play, Save, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JogMap, useGeoTracker } from "./jog-map";
import { useHabits, todayKey } from "@/lib/habits-store";
import { toast } from "sonner";

function fmt(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function JogPanel() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const tickRef = useRef<number | null>(null);
  const { pos, path, distance, error, setPath, setDistance } = useGeoTracker(running);
  const { runs, addRun } = useHabits();

  useEffect(() => {
    if (!running) return;
    tickRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [running]);

  const pace = distance > 0 ? fmt(Math.round(seconds / distance)) : "--:--";

  const save = () => {
    if (distance < 0.01) {
      toast.error("Run too short to save");
      return;
    }
    addRun({
      date: todayKey(),
      distanceKm: parseFloat(distance.toFixed(2)),
      durationSec: seconds,
      path,
    });
    toast.success(`Saved run: ${distance.toFixed(2)} km`);
    setRunning(false);
    setSeconds(0);
    setPath([]);
    setDistance(0);
  };

  const totalKm = runs.reduce((a, r) => a + r.distanceKm, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="overflow-hidden rounded-3xl border border-border bg-card p-2">
        <div className="h-[480px]">
          <JogMap position={pos} path={path} />
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-3xl border border-border bg-card p-6">
          {error && (
            <div className="mb-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              {error} — make sure location permission is allowed.
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Distance" value={`${distance.toFixed(2)} km`} />
            <Stat label="Time" value={fmt(seconds)} />
            <Stat label="Pace" value={`${pace} /km`} />
            <Stat label="Points" value={`${path.length}`} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {!running ? (
              <Button onClick={() => setRunning(true)} className="rounded-full">
                <Play className="mr-1 size-4" /> Start
              </Button>
            ) : (
              <Button onClick={() => setRunning(false)} variant="secondary" className="rounded-full">
                <Pause className="mr-1 size-4" /> Pause
              </Button>
            )}
            <Button onClick={save} variant="outline" className="rounded-full">
              <Save className="mr-1 size-4" /> Save run
            </Button>
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => {
                setRunning(false);
                setSeconds(0);
                setPath([]);
                setDistance(0);
              }}
            >
              <Square className="mr-1 size-4" /> Reset
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <h3 className="font-semibold">Lifetime</h3>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{totalKm.toFixed(2)} km</p>
          <p className="text-xs text-muted-foreground">{runs.length} runs logged</p>
          <div className="mt-3 max-h-48 space-y-2 overflow-auto">
            {runs.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-2 text-sm">
                <span>{r.date}</span>
                <span className="font-medium">{r.distanceKm.toFixed(2)} km · {fmt(r.durationSec)}</span>
              </div>
            ))}
            {runs.length === 0 && <p className="text-xs text-muted-foreground">No runs yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
