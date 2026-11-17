import { type TRPCClientErrorLike } from "@trpc/client";

import { type AppRouter } from "~/server/api/root";

/** Turn a failed form mutation into a short message people can act on. */
export function formErrorMessage(error: TRPCClientErrorLike<AppRouter>, invalidInput: string): string {
  if (error.data?.zodError) return invalidInput;
  if (error.data?.code === "TOO_MANY_REQUESTS") return error.message;
  return "Something went wrong. Please try again.";
}
