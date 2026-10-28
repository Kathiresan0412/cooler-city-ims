"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Search } from "lucide-react";

interface SearchResult {
  type: string;
  id: string;
  label: string;
  sub: string;
  href: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim();
    if (trimmedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setHasError(false);
      return;
    }

    const controller = new AbortController();
    const search = async () => {
      setLoading(true);
      setHasError(false);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error(`Search request failed with status ${response.status}`);
        }

        const data: { results?: SearchResult[] } = await response.json();
        setResults(data.results ?? []);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Global search request failed", error);
        setResults([]);
        setHasError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void search();
    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <div className="relative hidden w-64 md:block">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search products, GRNs..."
        className="pl-8 text-sm"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => setOpen(true)}
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {loading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">Searching...</p>
          ) : hasError ? (
            <p className="px-3 py-2 text-sm text-destructive">Search failed. Please try again.</p>
          ) : results.length > 0 ? (
            results.map((r) => (
              <button
                key={`${r.type}-${r.id}`}
                className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-accent"
                onMouseDown={() => {
                  router.push(r.href);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span className="font-medium">{r.label}</span>
                <span className="text-xs text-muted-foreground capitalize">{r.type} · {r.sub}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}
