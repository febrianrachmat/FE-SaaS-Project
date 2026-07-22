import { cn } from "@/shared/lib/utils";
import type { TaskLabel } from "../types";

const LABEL_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#64748B",
] as const;

export { LABEL_COLORS };

export function LabelChips({
  labels,
  className,
}: {
  labels?: TaskLabel[];
  className?: string;
}) {
  if (!labels?.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {labels.map((label) => (
        <span
          key={label.id}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white"
          style={{ backgroundColor: label.color }}
        >
          {label.name}
        </span>
      ))}
    </div>
  );
}
