import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD");

/** Upper bound in major units (e.g. dollars) to keep BigInt conversion safe. */
const MONEY_MAJOR_MAX = 10_000_000;

const httpUrl = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), {
    message: "Only http/https URLs are allowed.",
  });

export const createManualStatementSchema = z
  .object({
    cardId: z.string().min(1),
    periodStart: isoDate,
    periodEnd: isoDate,
    closingBalance: z.coerce.number().min(0).max(MONEY_MAJOR_MAX),
    minimumPayment: z.coerce.number().min(0).max(MONEY_MAJOR_MAX),
    paymentDueDate: z.union([isoDate, z.literal("")]).optional(),
    currency: z.string().trim().length(3).default("USD"),
    documentUrl: z.union([httpUrl, z.literal("")]).optional(),
  })
  .refine((data) => data.periodEnd >= data.periodStart, {
    message: "Period end must be on or after period start.",
    path: ["periodEnd"],
  });

export type CreateManualStatementInput = z.infer<
  typeof createManualStatementSchema
>;
