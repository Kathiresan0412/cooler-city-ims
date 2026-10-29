import Link from "next/link";

interface LogPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  pageParam: string;
  otherPageParam: string;
  otherPage: number;
}

export function LogPagination({
  page,
  pageSize,
  total,
  totalPages,
  pageParam,
  otherPageParam,
  otherPage,
}: LogPaginationProps) {
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);
  const hrefForPage = (targetPage: number) => {
    const params = new URLSearchParams({
      [pageParam]: String(targetPage),
      [otherPageParam]: String(otherPage),
    });
    return `/audit-logs?${params.toString()}`;
  };
  const linkClass =
    "rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted";
  const disabledClass = "pointer-events-none opacity-50";

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
      <p className="text-xs text-muted-foreground">
        Showing {firstItem}-{lastItem} of {total}
      </p>
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-2">
          <Link
            href={hrefForPage(page - 1)}
            aria-disabled={page <= 1}
            className={`${linkClass} ${page <= 1 ? disabledClass : ""}`}
          >
            Previous
          </Link>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Link
            href={hrefForPage(page + 1)}
            aria-disabled={page >= totalPages}
            className={`${linkClass} ${page >= totalPages ? disabledClass : ""}`}
          >
            Next
          </Link>
        </nav>
      )}
    </div>
  );
}
