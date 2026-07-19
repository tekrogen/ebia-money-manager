import { z } from "zod";

export const searchQuerySchema = z
  .string()
  .trim()
  .min(2, "Query must be at least 2 characters")
  .max(200, "Query must be at most 200 characters");

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
