import { signInAsDemoUser } from "@/features/authentication/actions/sign-in";
import { getCurrentUser } from "@/features/authentication/server/queries";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.onboardingComplete ? "/overview" : "/onboarding");
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[var(--tk-bg-1)] px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--tk-border)] bg-white p-8 shadow-sm">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Credit Card Manager
        </h1>
        <p className="mt-2 text-sm text-[var(--tk-fg-2)]">
          Phase 01 auth stub — sign in as the seeded demo household.
        </p>
        <form action={signInAsDemoUser} className="mt-6">
          <button
            type="submit"
            className="w-full rounded-md bg-[var(--tk-com)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Continue as Marti
          </button>
        </form>
      </div>
    </div>
  );
}
