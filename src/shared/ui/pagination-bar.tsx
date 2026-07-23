"use client";

import { Button } from "@/shared/ui/button";

type Props = {
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function PaginationBar({
  page,
  totalPages,
  total,
  onPageChange,
  className,
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={
        className ??
        "flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-slate-500"
      }
    >
      <p>
        Page {page} of {totalPages}
        {typeof total === "number" ? ` · ${total} total` : ""}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
