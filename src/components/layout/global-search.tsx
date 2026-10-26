"use client";

import { useState } from "react";
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
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);

  useState(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => setResults(data.results ?? []));
  });

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
      {open && results.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {results.map((r) => (
            <button
              key={r.id}
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
          ))}
        </div>
      )}
    </div>
  );
}
