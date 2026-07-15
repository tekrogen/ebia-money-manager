export type IntentActionState = {
  success: boolean;
  message: string;
  intentId?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialIntentState: IntentActionState = {
  success: false,
  message: "",
};
