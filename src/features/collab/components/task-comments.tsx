"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type TextareaHTMLAttributes,
} from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/shared/ui/button";
import { useAuthStore } from "@/features/auth";
import { useWorkspaceMembers } from "@/features/workspace";
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  collabKeys,
} from "../hooks/use-collab";
import { collabApi } from "../api/collab.api";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  taskId: string;
};

type MentionCandidate = {
  id: string;
  name: string;
  email: string;
  token: string;
};

function mentionTokenFor(name: string, email: string) {
  const fromName = name.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  if (/^[a-z0-9._-]+$/.test(fromName) && fromName.length >= 2) return fromName;
  return email.split("@")[0].toLowerCase();
}

function CommentBody({ body }: { body: string }) {
  const parts = body.split(/(@[a-zA-Z0-9._-]+)/g);
  return (
    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-zinc-300">
      {parts.map((part, i) =>
        part.startsWith("@") && part.length > 1 ? (
          <span
            key={`${part}-${i}`}
            className="rounded bg-sky-100 px-1 py-0.5 font-medium text-sky-800 dark:bg-sky-950 dark:text-sky-300"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}

function MentionTextarea({
  workspaceSlug,
  value,
  onChange,
  className,
  ...props
}: {
  workspaceSlug: string;
  value: string;
  onChange: (next: string) => void;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  const { data: members = [] } = useWorkspaceMembers(workspaceSlug);
  const me = useAuthStore((s) => s.user);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const candidates = useMemo<MentionCandidate[]>(
    () =>
      members
        .filter((m) => m.userId !== me?.id)
        .map((m) => ({
          id: m.userId,
          name: m.user.name,
          email: m.user.email,
          token: mentionTokenFor(m.user.name, m.user.email),
        })),
    [members, me?.id],
  );

  const mentionState = useMemo(() => {
    const cursor = textareaRef.current?.selectionStart ?? value.length;
    const before = value.slice(0, cursor);
    const match = before.match(/@([a-zA-Z0-9._-]*)$/);
    if (!match) return null;
    const query = match[1].toLowerCase();
    const filtered = candidates.filter(
      (c) =>
        c.token.includes(query) ||
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query),
    );
    return {
      query,
      start: cursor - match[0].length,
      end: cursor,
      filtered: filtered.slice(0, 6),
    };
  }, [value, candidates]);

  useEffect(() => {
    setActiveIndex(0);
  }, [mentionState?.query]);

  const insertMention = (candidate: MentionCandidate) => {
    if (!mentionState) return;
    const next =
      value.slice(0, mentionState.start) +
      `@${candidate.token} ` +
      value.slice(mentionState.end);
    onChange(next);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      const pos = mentionState.start + candidate.token.length + 2;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!mentionState || mentionState.filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % mentionState.filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (i) =>
          (i - 1 + mentionState.filtered.length) %
          mentionState.filtered.length,
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertMention(mentionState.filtered[activeIndex]!);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onChange(value);
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        className={cn(
          "min-h-20 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900",
          className,
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        {...props}
      />
      {mentionState && mentionState.filtered.length > 0 ? (
        <ul
          className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-950"
          role="listbox"
        >
          {mentionState.filtered.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                className={cn(
                  "flex w-full flex-col items-start px-3 py-2 text-left text-sm",
                  i === activeIndex
                    ? "bg-primary-50 text-primary-900 dark:bg-primary-950/40 dark:text-primary-100"
                    : "hover:bg-slate-50 dark:hover:bg-zinc-900",
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMention(c);
                }}
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-slate-500">
                  @{c.token} · {c.email}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function TaskComments({ workspaceSlug, projectSlug, taskId }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useComments(workspaceSlug, projectSlug, taskId);
  const create = useCreateComment(workspaceSlug, projectSlug, taskId);
  const update = useUpdateComment(workspaceSlug, projectSlug, taskId);
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const qc = useQueryClient();

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-500">Comments</p>
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <ul className="space-y-3">
          {(data ?? []).map((c) => (
            <li
              key={c.id}
              className="rounded-lg bg-slate-50 p-3 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{c.author.name}</p>
                  {editingId === c.id ? (
                    <div className="mt-2 space-y-2">
                      <MentionTextarea
                        workspaceSlug={workspaceSlug}
                        value={editBody}
                        onChange={setEditBody}
                        aria-label="Edit comment"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={update.isPending || !editBody.trim()}
                          onClick={async () => {
                            await update.mutateAsync({
                              commentId: c.id,
                              body: editBody.trim(),
                            });
                            setEditingId(null);
                          }}
                        >
                          {update.isPending ? "Saving…" : "Save"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CommentBody body={c.body} />
                      <p className="mt-1 text-[11px] text-slate-400">
                        {format(parseISO(c.createdAt), "MMM d, HH:mm")}
                        {c.updatedAt !== c.createdAt ? " · edited" : ""}
                      </p>
                    </>
                  )}
                </div>
                {user?.id === c.author.id && editingId !== c.id ? (
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(c.id);
                        setEditBody(c.body);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await collabApi.deleteComment(
                          workspaceSlug,
                          projectSlug,
                          taskId,
                          c.id,
                        );
                        void qc.invalidateQueries({
                          queryKey: collabKeys.comments(
                            workspaceSlug,
                            projectSlug,
                            taskId,
                          ),
                        });
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
          {(data ?? []).length === 0 ? (
            <li className="text-sm text-slate-400">No comments yet.</li>
          ) : null}
        </ul>
      )}

      <form
        className="space-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!body.trim()) return;
          await create.mutateAsync(body.trim());
          setBody("");
        }}
      >
        <MentionTextarea
          workspaceSlug={workspaceSlug}
          value={body}
          onChange={setBody}
          placeholder="Write a comment… Type @ to mention"
        />
        <Button
          type="submit"
          size="sm"
          disabled={create.isPending || !body.trim()}
        >
          {create.isPending ? "Posting…" : "Post comment"}
        </Button>
      </form>
    </div>
  );
}
