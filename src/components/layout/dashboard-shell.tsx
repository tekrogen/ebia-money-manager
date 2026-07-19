import Link from "next/link";

import { GlobalSearch } from "@/components/layout/global-search";
import { signOut } from "@/features/authentication/actions/sign-in";
import type { AuthenticatedUser } from "@/features/authentication/server/queries";

const nav = [
  { href: "/overview", label: "Dashboard" },
  { href: "/cards", label: "Cards" },
  { href: "/payments", label: "Payments" },
  { href: "/settings/household", label: "Household" },
] as const;

export function DashboardShell({
  user,
  children,
}: {
  user: AuthenticatedUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-[var(--tk-bg-1)] text-[var(--tk-fg-1)]">
      <header className="border-b border-[var(--tk-border)] bg-[var(--tk-bg-2)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/overview" className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
              Credit Card Manager
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-[var(--tk-fg-2)] md:flex">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-[var(--tk-com)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <GlobalSearch />
            <span className="hidden text-[var(--tk-fg-3)] sm:inline">
              {user.name}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-[var(--tk-border)] px-3 py-1.5 hover:bg-[var(--tk-bg-3)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
