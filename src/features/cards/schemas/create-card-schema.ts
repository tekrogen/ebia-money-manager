import { z } from "zod";

export const createManualCardSchema = z.object({
  name: z.string().trim().min(1).max(80),
  network: z.string().trim().min(1).max(40),
  lastFour: z.string().regex(/^\d{4}$/),
  currency: z.string().trim().length(3).default("USD"),
  creditLimit: z.coerce.number().positive(),
  currentBalance: z.coerce.number().min(0),
  minimumPayment: z.coerce.number().min(0).default(0),
  regularAprPercent: z.coerce.number().min(0).max(100).default(0),
  paymentDueDay: z.coerce.number().int().min(1).max(31).optional(),
  attribution: z.enum(["member", "shared"]).default("member"),
  ownerMemberId: z.string().cuid().optional().nullable(),
  issuerKey: z.string().trim().max(40).optional(),
});

export type CreateManualCardInput = z.infer<typeof createManualCardSchema>;
