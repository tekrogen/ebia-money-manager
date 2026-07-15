import { z } from "zod";

export const selectCardSchema = z.object({
  intentId: z.string().min(1),
  cardId: z.string().min(1),
});

export const selectAmountSchema = z.object({
  intentId: z.string().min(1),
  amountType: z.enum(["minimum", "statement", "current", "custom"]),
  customAmountMinor: z
    .number()
    .int()
    .positive()
    .optional(),
});

export const selectAccountSchema = z.object({
  intentId: z.string().min(1),
  accountId: z.string().min(1),
});

export const confirmIntentSchema = z.object({
  intentId: z.string().min(1),
  scheduledFor: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
});

export const rescheduleRunwayItemSchema = z.object({
  itemId: z.string().min(1),
  newPlannedPayDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
});

export type SelectCardInput = z.infer<typeof selectCardSchema>;
export type SelectAmountInput = z.infer<typeof selectAmountSchema>;
export type SelectAccountInput = z.infer<typeof selectAccountSchema>;
export type ConfirmIntentInput = z.infer<typeof confirmIntentSchema>;
export type RescheduleRunwayItemInput = z.infer<typeof rescheduleRunwayItemSchema>;
