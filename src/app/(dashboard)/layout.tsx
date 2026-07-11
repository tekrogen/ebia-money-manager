import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireCurrentUser } from "@/features/authentication/server/queries";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCurrentUser();
  if (!user.onboardingComplete) {
    redirect("/onboarding");
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
