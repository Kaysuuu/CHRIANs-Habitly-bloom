import confetti from "canvas-confetti";

let audioCtx: AudioContext | null = null;
function getAudio() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return null; }
  }
  return audioCtx;
}

export function playSuccessChime() {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.18, now + i * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.4);
  });
}

export function celebrate(origin?: { x: number; y: number }) {
  const colors = ["#a78bfa", "#7c3aed", "#22d3ee", "#34d399", "#fbbf24", "#f472b6"];
  const o = origin ?? { x: 0.5, y: 0.4 };
  confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 45,
    origin: o,
    colors,
    scalar: 0.9,
    ticks: 200,
  });
  setTimeout(() => {
    confetti({ particleCount: 40, spread: 100, origin: o, colors, scalar: 0.7, gravity: 0.6 });
  }, 150);
}

export function celebrateBig() {
  const colors = ["#a78bfa", "#7c3aed", "#22d3ee", "#34d399", "#fbbf24", "#f472b6"];
  const end = Date.now() + 1200;
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
