"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE } from "@/features/authentication/server/queries";
import { db } from "@/lib/db/client";

export async function signInAsDemoUser() {
  const user = await db.user.findUnique({
    where: { email: "marti@example.com" },
  });

  if (!user) {
    throw new Error("Demo user missing. Run pnpm db:seed.");
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  const cardCount = await db.creditCard.count({
    where: {
      household: {
        memberships: { some: { userId: user.id } },
      },
      status: { not: "archived" },
    },
  });

  redirect(cardCount > 0 ? "/overview" : "/onboarding");
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/auth/sign-in");
}
