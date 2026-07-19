export type StatementActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialStatementState: StatementActionState = {
  success: false,
  message: "",
};
