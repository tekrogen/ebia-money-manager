import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db/client";

export const SESSION_COOKIE = "ccm_session";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  householdId: string;
  onboardingComplete: boolean;
};

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const jar = await cookies();
  const userId = jar.get(SESSION_COOKIE)?.value;
  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        take: 1,
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user || user.memberships.length === 0) {
    return null;
  }

  const householdId = user.memberships[0].householdId;
  const cardCount = await db.creditCard.count({
    where: {
      householdId,
      status: { not: "archived" },
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    householdId,
    onboardingComplete: cardCount > 0,
  };
}

export async function requireCurrentUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/sign-in");
  }
  return user;
}

export async function requireOnboardedUser(): Promise<AuthenticatedUser> {
  const user = await requireCurrentUser();
  if (!user.onboardingComplete) {
    redirect("/onboarding");
  }
  return user;
}
