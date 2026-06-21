import { z } from "zod";

export const commentBodySchema = z
  .string()
  .trim()
  .min(1, "Write a comment before posting.")
  .max(10000, "Use no more than 10,000 characters.");
