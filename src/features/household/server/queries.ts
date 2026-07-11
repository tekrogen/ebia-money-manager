import { db } from "@/lib/db/client";

export async function getHouseholdMembers(householdId: string) {
  return db.householdMember.findMany({
    where: { householdId },
    orderBy: { displayName: "asc" },
  });
}
