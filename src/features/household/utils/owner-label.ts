export function getOwnerLabel(
  attribution: "member" | "shared",
  displayName: string | null | undefined,
): string {
  if (attribution === "shared") {
    return "Shared";
  }
  return displayName ?? "Unassigned";
}
