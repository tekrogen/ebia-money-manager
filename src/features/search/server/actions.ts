"use server";

import { requireCurrentUser } from "@/features/authentication";

import { searchQuerySchema } from "../schemas";
import { emptySearchGroups, type SearchGroupsDTO } from "../types";
import { searchOrEmpty } from "./service";

export async function searchAction(query: string): Promise<SearchGroupsDTO> {
  const parsed = searchQuerySchema.safeParse(query);
  if (!parsed.success) {
    return emptySearchGroups(typeof query === "string" ? query.trim() : "");
  }

  try {
    const user = await requireCurrentUser();
    return await searchOrEmpty(parsed.data, {
      userId: user.id,
      householdId: user.householdId,
    });
  } catch {
    return emptySearchGroups(parsed.data);
  }
}
