"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { SearchPalette, searchAction } from "@/features/search";
import type { SearchGroupsDTO } from "@/features/search";

const DEBOUNCE_MS = 250;

export function GlobalSearch() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchGroupsDTO | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const close = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setOpen(false);
    setQuery("");
    setResults(null);
    setIsPending(false);
    setActiveIndex(0);
    queueMicrotask(() => triggerRef.current?.focus());
  }, []);

  const openPalette = useCallback(() => {
    setOpen(true);
  }, []);

  const scheduleSearch = useCallback((raw: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    const trimmed = raw.trim();
    if (trimmed.length < 2) {
      setResults(null);
      setIsPending(false);
      return;
    }

    setIsPending(true);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const next = await searchAction(trimmed);
        setResults(next);
        setActiveIndex(0);
        setIsPending(false);
      });
    }, DEBOUNCE_MS);
  }, []);

  const onQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      scheduleSearch(value);
    },
    [scheduleSearch],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const trimmedQuery = query.trim();
  const showResults = trimmedQuery.length >= 2;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPalette}
        aria-label="Search"
        aria-keyshortcuts="Meta+k Control+k"
        className="rounded-md border border-[var(--tk-border)] px-3 py-1.5 text-[var(--tk-fg-2)] hover:bg-[var(--tk-bg-3)]"
      >
        Search
        <kbd className="ml-2 hidden rounded border border-[var(--tk-border)] px-1.5 py-0.5 text-[10px] text-[var(--tk-fg-3)] md:inline">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <SearchPalette
          query={query}
          groups={showResults ? (results?.groups ?? null) : null}
          totalCount={showResults ? (results?.totalCount ?? 0) : 0}
          isPending={isPending}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onQueryChange={onQueryChange}
          onClose={close}
        />
      ) : null}
    </>
  );
}
