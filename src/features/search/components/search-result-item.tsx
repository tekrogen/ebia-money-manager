"use client";

import type { SearchResultItem } from "../types";

type SearchResultItemProps = {
  item: SearchResultItem;
  isActive: boolean;
  onHighlight: () => void;
  onSelect: () => void;
};

const kindLabel: Record<SearchResultItem["kind"], string> = {
  card: "Card",
  statement: "Stmt",
  payment: "Pay",
};

export function SearchResultItemRow({
  item,
  isActive,
  onHighlight,
  onSelect,
}: SearchResultItemProps) {
  return (
    <li
      id={`search-result-${item.id}`}
      role="option"
      aria-selected={isActive}
      className={[
        "cursor-pointer rounded-md px-3 py-2",
        isActive
          ? "bg-[var(--tk-bg-3)] text-[var(--tk-fg-1)]"
          : "hover:bg-[var(--tk-bg-3)]",
      ].join(" ")}
      onMouseEnter={onHighlight}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 w-10 shrink-0 text-xs font-medium uppercase tracking-wide text-[var(--tk-fg-3)]">
          {kindLabel[item.kind]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{item.title}</p>
          <p className="truncate text-xs text-[var(--tk-fg-2)]">{item.subtitle}</p>
          {item.meta ? (
            <p className="truncate text-xs text-[var(--tk-fg-3)]">{item.meta}</p>
          ) : null}
        </div>
      </div>
    </li>
  );
}
