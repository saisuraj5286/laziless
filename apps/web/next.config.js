/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

import path from "node:path";
import { fileURLToPath } from "node:url";

/** The monorepo root (two levels up from apps/web). */
const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** @type {import("next").NextConfig} */
const config = {
  // Shared workspace packages ship TypeScript source; let Next compile them.
  transpilePackages: ["@laziless/core"],
  // Native password-hashing module: load it with Node at runtime, don't bundle it.
  serverExternalPackages: ["@node-rs/argon2"],
  // Pin the workspace root so Next doesn't pick up stray lockfiles elsewhere.
  outputFileTracingRoot: monorepoRoot,
  turbopack: { root: monorepoRoot },
};

export default config;
