"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ApiError } from "@/shared/types/api";
import { projectApi } from "../api/project.api";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
};

export function ShareLinksPanel({ workspaceSlug, projectSlug }: Props) {
  const qc = useQueryClient();
  const [revealedUrl, setRevealedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<string>("");

  const { data: links = [], isLoading } = useQuery({
    queryKey: ["projects", workspaceSlug, projectSlug, "share-links"],
    queryFn: () => projectApi.listShareLinks(workspaceSlug, projectSlug),
  });

  const create = useMutation({
    mutationFn: () =>
      projectApi.createShareLink(workspaceSlug, projectSlug, {
        ...(expiresInDays
          ? { expiresInDays: Number(expiresInDays) }
          : {}),
      }),
    onSuccess: (data) => {
      setRevealedUrl(data.url ?? null);
      setCopied(false);
      void qc.invalidateQueries({
        queryKey: ["projects", workspaceSlug, projectSlug, "share-links"],
      });
    },
  });

  const revoke = useMutation({
    mutationFn: (linkId: string) =>
      projectApi.revokeShareLink(workspaceSlug, projectSlug, linkId),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ["projects", workspaceSlug, projectSlug, "share-links"],
      });
    },
  });

  const active = links.filter((l) => !l.revokedAt);

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h2 className="text-sm font-semibold">Shareable link</h2>
        <p className="mt-1 text-xs text-slate-500">
          Anyone with the link can view this project read-only — no login
          required.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-slate-500">
          Expires (days, optional)
          <input
            type="number"
            min={1}
            max={365}
            className="mt-1 flex h-10 w-28 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
            placeholder="Never"
          />
        </label>
        <Button
          type="button"
          size="sm"
          disabled={create.isPending}
          onClick={() => create.mutate()}
        >
          {create.isPending ? "Creating…" : "Create link"}
        </Button>
      </div>

      {revealedUrl ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
          <code className="min-w-0 flex-1 truncate text-xs">{revealedUrl}</code>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={async () => {
              await navigator.clipboard.writeText(revealedUrl);
              setCopied(true);
            }}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      ) : null}

      {create.error instanceof ApiError ? (
        <p className="text-sm text-danger-600">{create.error.message}</p>
      ) : null}

      {isLoading ? (
        <p className="text-xs text-slate-400">Loading links…</p>
      ) : active.length === 0 ? (
        <p className="text-xs text-slate-400">No active share links.</p>
      ) : (
        <ul className="space-y-2">
          {active.map((link) => (
            <li
              key={link.id}
              className="flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-zinc-300"
            >
              <span>
                {link.tokenPrefix}… · created{" "}
                {new Date(link.createdAt).toLocaleDateString()}
                {link.expiresAt
                  ? ` · expires ${new Date(link.expiresAt).toLocaleDateString()}`
                  : " · no expiry"}
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={revoke.isPending}
                onClick={() => {
                  if (confirm("Revoke this share link?")) {
                    revoke.mutate(link.id);
                  }
                }}
              >
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
