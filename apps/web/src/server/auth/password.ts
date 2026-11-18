import "server-only";

import { hash, verify } from "@node-rs/argon2";

/** Argon2id with the recommended minimum parameters (from the Lucia guide). */
const ARGON2 = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

export const hashPassword = (password: string) => hash(password, ARGON2);

export const verifyPassword = (passwordHash: string, password: string) =>
  verify(passwordHash, password, ARGON2);
