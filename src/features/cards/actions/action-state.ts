export type CreateCardState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialCreateCardState: CreateCardState = {
  success: false,
  message: "",
};
