import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/authentication/server/queries";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/sign-in");
  }
  redirect(user.onboardingComplete ? "/overview" : "/onboarding");
}
