"use client";

import type { SearchResultItem } from "../types";
import { SearchResultItemRow } from "./search-result-item";

type SearchResultGroupProps = {
  label: string;
  items: SearchResultItem[];
  activeId: string | null;
  onHighlight: (item: SearchResultItem) => void;
  onSelect: (item: SearchResultItem) => void;
};

export function SearchResultGroup({
  label,
  items,
  activeId,
  onHighlight,
  onSelect,
}: SearchResultGroupProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="px-2 py-2">
      <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[var(--tk-fg-3)]">
        {label}
      </p>
      <ul role="group" aria-label={label} className="space-y-0.5">
        {items.map((item) => (
          <SearchResultItemRow
            key={item.id}
            item={item}
            isActive={activeId === item.id}
            onHighlight={() => onHighlight(item)}
            onSelect={() => onSelect(item)}
          />
        ))}
      </ul>
    </div>
  );
}
