"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import type { SearchGroupsDTO, SearchResultItem } from "../types";
import { SearchResultGroup } from "./search-result-group";

type SearchPaletteProps = {
  query: string;
  groups: SearchGroupsDTO["groups"] | null;
  totalCount: number;
  isPending: boolean;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onQueryChange: (value: string) => void;
  onClose: () => void;
};

function flattenGroups(
  groups: SearchGroupsDTO["groups"] | null,
): SearchResultItem[] {
  if (!groups) {
    return [];
  }
  return [...groups.cards, ...groups.statements, ...groups.payments];
}

export function SearchPalette({
  query,
  groups,
  totalCount,
  isPending,
  activeIndex,
  onActiveIndexChange,
  onQueryChange,
  onClose,
}: SearchPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const flat = useMemo(() => flattenGroups(groups), [groups]);
  const activeItem = flat[activeIndex] ?? null;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (flat.length === 0) {
          return;
        }
        onActiveIndexChange((activeIndex + 1) % flat.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (flat.length === 0) {
          return;
        }
        onActiveIndexChange((activeIndex - 1 + flat.length) % flat.length);
        return;
      }

      if (event.key === "Enter" && activeItem) {
        event.preventDefault();
        router.push(activeItem.href);
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, activeItem, flat.length, onActiveIndexChange, onClose, router]);

  useEffect(() => {
    function onTabTrap(event: KeyboardEvent) {
      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onTabTrap);
    return () => document.removeEventListener("keydown", onTabTrap);
  }, []);

  function selectItem(item: SearchResultItem) {
    router.push(item.href);
    onClose();
  }

  function highlightItem(item: SearchResultItem) {
    const index = flat.findIndex((entry) => entry.id === item.id);
    if (index >= 0) {
      onActiveIndexChange(index);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close search"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-lg border border-[var(--tk-border)] bg-[var(--tk-bg-2)] shadow-lg"
      >
        <div className="border-b border-[var(--tk-border)] px-3 py-3">
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={
              activeItem ? `search-result-${activeItem.id}` : undefined
            }
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search cards, statements, payments…"
            className="w-full bg-transparent text-base outline-none placeholder:text-[var(--tk-fg-3)]"
          />
        </div>

        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {isPending
            ? "Searching"
            : query.trim().length >= 2
              ? `${totalCount} results`
              : "Type at least 2 characters"}
        </div>

        <div id={listboxId} role="listbox" className="max-h-[50vh] overflow-y-auto py-1">
          {isPending && !groups ? (
            <p className="px-5 py-4 text-sm text-[var(--tk-fg-3)]">Searching…</p>
          ) : null}

          {!isPending && query.trim().length >= 2 && totalCount === 0 ? (
            <p className="px-5 py-4 text-sm text-[var(--tk-fg-3)]">
              No results for &ldquo;{query.trim()}&rdquo;
            </p>
          ) : null}

          {groups ? (
            <>
              <SearchResultGroup
                label="Cards"
                items={groups.cards}
                activeId={activeItem?.id ?? null}
                onHighlight={highlightItem}
                onSelect={selectItem}
              />
              <SearchResultGroup
                label="Statements"
                items={groups.statements}
                activeId={activeItem?.id ?? null}
                onHighlight={highlightItem}
                onSelect={selectItem}
              />
              <SearchResultGroup
                label="Payments"
                items={groups.payments}
                activeId={activeItem?.id ?? null}
                onHighlight={highlightItem}
                onSelect={selectItem}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
