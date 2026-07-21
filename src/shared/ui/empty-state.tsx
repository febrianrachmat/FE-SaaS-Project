import type { ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900/40",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 text-slate-400 dark:text-zinc-500">{icon}</div>
      ) : null}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-50">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-zinc-400">
        {description}
      </p>
      {actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
