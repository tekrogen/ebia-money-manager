import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD");

export const createManualStatementSchema = z
  .object({
    cardId: z.string().min(1),
    periodStart: isoDate,
    periodEnd: isoDate,
    closingBalance: z.coerce.number().min(0),
    minimumPayment: z.coerce.number().min(0),
    paymentDueDate: z.union([isoDate, z.literal("")]).optional(),
    currency: z.string().trim().length(3).default("USD"),
    documentUrl: z.union([z.string().url(), z.literal("")]).optional(),
  })
  .refine((data) => data.periodEnd >= data.periodStart, {
    message: "Period end must be on or after period start.",
    path: ["periodEnd"],
  });

export type CreateManualStatementInput = z.infer<
  typeof createManualStatementSchema
>;
