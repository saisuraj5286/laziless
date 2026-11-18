import { TRPCError } from "@trpc/server";
import { z } from "zod";

/**
 * Honeypot field for public forms. The form hides it from people (and screen
 * readers); simple bots fill in every field. A filled-in honeypot means "pretend
 * it worked, store nothing".
 */
export const honeypot = z.string().max(500).optional();

const HOUR = 60 * 60_000;
const hits = new Map<string, number[]>();

export const TOO_MANY_TRIES = "Too many tries from your network. Please try again in a little while.";

/**
 * In-memory rate limit per client IP. Each server instance keeps its own
 * counts, so this is a speed bump against bots and accidental double-submits,
 * not a hard guarantee. The IP is only held in memory, never stored.
 *
 * Records this attempt and returns true if the limit was already reached.
 */
export function isRateLimited(
  headers: Headers,
  bucket: string,
  limitPerHour: number,
  now = Date.now(),
): boolean {
  const key = `${bucket}:${clientIp(headers)}`;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < HOUR);

  if (recent.length >= limitPerHour) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) hits.clear(); // keep memory bounded
  return false;
}

/** {@link isRateLimited} for tRPC procedures: throws TOO_MANY_REQUESTS. */
export function enforceRateLimit(
  headers: Headers,
  bucket: string,
  limitPerHour: number,
  now = Date.now(),
): void {
  if (isRateLimited(headers, bucket, limitPerHour, now)) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: TOO_MANY_TRIES });
  }
}

function clientIp(headers: Headers): string {
  // On Vercel, x-forwarded-for is set by the platform, so the first entry is the client.
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded ?? headers.get("x-real-ip") ?? "unknown";
}
