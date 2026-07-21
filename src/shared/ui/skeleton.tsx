import { cn } from "@/shared/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200/80 dark:bg-zinc-800",
        className,
      )}
      aria-hidden
    />
  );
}
