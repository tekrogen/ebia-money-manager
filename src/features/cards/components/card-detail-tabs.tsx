"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { CardDetailItem } from "@/features/cards";

const tabs = [
  { segment: "statements", label: "Statements" },
  { segment: "details", label: "Details" },
] as const;

export function CardDetailTabs({ card }: { card: CardDetailItem }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 border-b border-[var(--tk-border)] text-sm">
      {tabs.map((tab) => {
        const href = `/cards/${card.id}/${tab.segment}`;
        const active = pathname.startsWith(href);
        return (
          <Link
            key={tab.segment}
            href={href}
            className={`border-b-2 pb-2 ${
              active
                ? "border-[var(--tk-com)] text-[var(--tk-fg-1)]"
                : "border-transparent text-[var(--tk-fg-3)] hover:text-[var(--tk-fg-1)]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
