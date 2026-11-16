export type NotifyPermission = NotificationPermission | "unsupported";

export function getNotifyPermission(): NotifyPermission {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotifyPermission(): Promise<NotifyPermission> {
  if (getNotifyPermission() === "unsupported") return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return getNotifyPermission();
  }
}

export function showNotification(title: string, body: string): void {
  if (getNotifyPermission() !== "granted") return;
  try {
    const n = new Notification(title, { body, tag: "laziless-nudge", icon: "/favicon.ico" });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // Some mobile browsers only allow notifications via a service worker.
  }
}

let audioCtx: AudioContext | null = null;

/** A short, soft two-note chime generated with Web Audio (no asset needed). */
export function playChime(): void {
  try {
    audioCtx ??= new AudioContext();
    const ctx = audioCtx;
    void ctx.resume();
    const start = ctx.currentTime;
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = start + i * 0.18;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  } catch {
    // Audio unavailable (e.g. no user interaction yet) — silently skip.
  }
}
