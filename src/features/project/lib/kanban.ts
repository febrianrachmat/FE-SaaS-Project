export const KANBAN_COLUMNS = [
  { id: "BACKLOG", label: "Backlog" },
  { id: "TODO", label: "Todo" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "REVIEW", label: "Review" },
  { id: "TESTING", label: "Testing" },
  { id: "DONE", label: "Done" },
] as const;

export type KanbanColumnId = (typeof KANBAN_COLUMNS)[number]["id"];

/** Midpoint positioning so reorders don't require rewriting the whole column. */
export function computePosition(
  before: number | null | undefined,
  after: number | null | undefined,
): number {
  if (before == null && after == null) return 1000;
  if (before == null && after != null) return after / 2;
  if (before != null && after == null) return before + 1000;
  return (before! + after!) / 2;
}
