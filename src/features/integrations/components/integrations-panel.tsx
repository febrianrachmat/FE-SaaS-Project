"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { ApiError } from "@/shared/types/api";
import { useWorkspace } from "@/features/workspace";
import {
  useApiKeys,
  useCreateApiKey,
  useCreateWebhook,
  useDeleteWebhook,
  useRevokeApiKey,
  useUpdateWebhook,
  useWebhookDeliveries,
  useWebhooks,
} from "../hooks/use-integrations";
import { WEBHOOK_EVENT_OPTIONS, type Webhook } from "../types";

type Props = { workspaceSlug: string };

function formatWhen(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function WebhookRow({
  hook,
  workspaceSlug,
  showDeliveries,
  onToggleDeliveries,
  onPauseToggle,
  onDelete,
  pausePending,
  deletePending,
}: {
  hook: Webhook;
  workspaceSlug: string;
  showDeliveries: boolean;
  onToggleDeliveries: () => void;
  onPauseToggle: () => void;
  onDelete: () => void;
  pausePending: boolean;
  deletePending: boolean;
}) {
  const { data: deliveries = [], isLoading: deliveriesLoading } =
    useWebhookDeliveries(workspaceSlug, hook.id, showDeliveries);

  return (
    <li className="px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="truncate font-medium text-slate-900 dark:text-zinc-50">
            {hook.url}
          </p>
          <p className="text-xs text-slate-400">
            {hook.events.join(", ")}
            {hook.hasSecret ? " · secret set" : null}
            {" · "}
            {hook.isActive ? "active" : "paused"}
            {" · last fired "}
            {formatWhen(hook.lastFiredAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={onToggleDeliveries}>
            {showDeliveries ? "Hide log" : "Delivery log"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={pausePending}
            onClick={onPauseToggle}
          >
            {hook.isActive ? "Pause" : "Resume"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-danger-600"
            disabled={deletePending}
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      {showDeliveries ? (
        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
          {deliveriesLoading ? (
            <p className="text-xs text-slate-400">Loading deliveries…</p>
          ) : deliveries.length === 0 ? (
            <p className="text-xs text-slate-400">
              No delivery attempts yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {deliveries.map((d) => (
                <li key={d.id} className="text-xs text-slate-600 dark:text-zinc-300">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        d.success
                          ? "font-medium text-emerald-600"
                          : "font-medium text-rose-600"
                      }
                    >
                      {d.success ? "OK" : "Fail"}
                    </span>
                    <span>{d.event}</span>
                    <span>
                      {d.statusCode != null ? `HTTP ${d.statusCode}` : "network"}
                    </span>
                    <span>attempt {d.attempt}</span>
                    <span className="text-slate-400">{formatWhen(d.createdAt)}</span>
                  </div>
                  {d.responseSnippet ? (
                    <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">
                      {d.responseSnippet}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </li>
  );
}

export function IntegrationsPanel({ workspaceSlug }: Props) {
  const { data: workspace, isLoading: workspaceLoading } =
    useWorkspace(workspaceSlug);
  const canManage =
    workspace?.role === "ADMIN" || workspace?.role === "OWNER";

  const { data: webhooks = [], isLoading: webhooksLoading } = useWebhooks(
    workspaceSlug,
    canManage,
  );
  const { data: apiKeys = [], isLoading: keysLoading } = useApiKeys(
    workspaceSlug,
    canManage,
  );

  const createWebhook = useCreateWebhook(workspaceSlug);
  const updateWebhook = useUpdateWebhook(workspaceSlug);
  const deleteWebhook = useDeleteWebhook(workspaceSlug);
  const createApiKey = useCreateApiKey(workspaceSlug);
  const revokeApiKey = useRevokeApiKey(workspaceSlug);

  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [events, setEvents] = useState<string[]>([
    "task.assigned",
    "task.updated",
    "comment.added",
    "mention",
  ]);
  const [keyName, setKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deliveriesFor, setDeliveriesFor] = useState<string | null>(null);

  function toggleEvent(value: string) {
    setEvents((prev) =>
      prev.includes(value)
        ? prev.filter((e) => e !== value)
        : [...prev, value],
    );
  }

  if (workspaceLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            Integrations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Webhooks and API keys are managed by workspace admins.
          </p>
        </div>
        <EmptyState
          title="Admin access required"
          description="Ask an owner or admin to configure integrations for this workspace."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Integrations
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Push workspace events to external URLs and manage API keys.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Webhooks</h2>

        <form
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
          onSubmit={(e) => {
            e.preventDefault();
            if (!url.trim() || events.length === 0) return;
            createWebhook.mutate(
              {
                url: url.trim(),
                ...(secret.trim() ? { secret: secret.trim() } : {}),
                events,
              },
              {
                onSuccess: () => {
                  setUrl("");
                  setSecret("");
                },
              },
            );
          }}
        >
          <div>
            <Label htmlFor="webhook-url">Endpoint URL</Label>
            <Input
              id="webhook-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/hooks/flowpilot"
            />
          </div>
          <div>
            <Label htmlFor="webhook-secret">Signing secret (optional)</Label>
            <Input
              id="webhook-secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Used for X-FlowPilot-Signature (HMAC-SHA256)"
              maxLength={256}
            />
            <p className="mt-1 text-xs text-slate-500">
              Deliveries include{" "}
              <code className="text-[11px]">X-FlowPilot-Signature</code> over{" "}
              <code className="text-[11px]">timestamp.body</code>, with up to 3
              retries on 5xx/429.
            </p>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Events</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {WEBHOOK_EVENT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-300"
                >
                  <input
                    type="checkbox"
                    checked={events.includes(opt.value)}
                    onChange={() => toggleEvent(opt.value)}
                    className="rounded border-slate-300"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>
          {createWebhook.error instanceof ApiError ? (
            <p className="text-sm text-danger-600">
              {createWebhook.error.message}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={
              createWebhook.isPending || !url.trim() || events.length === 0
            }
          >
            {createWebhook.isPending ? "Adding…" : "Add webhook"}
          </Button>
        </form>

        {webhooksLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : webhooks.length === 0 ? (
          <EmptyState
            title="No webhooks"
            description="Add an endpoint to receive task and comment events."
          />
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {webhooks.map((hook) => (
              <WebhookRow
                key={hook.id}
                hook={hook}
                workspaceSlug={workspaceSlug}
                showDeliveries={deliveriesFor === hook.id}
                onToggleDeliveries={() =>
                  setDeliveriesFor((id) => (id === hook.id ? null : hook.id))
                }
                onPauseToggle={() =>
                  updateWebhook.mutate({
                    webhookId: hook.id,
                    isActive: !hook.isActive,
                  })
                }
                onDelete={() => {
                  if (window.confirm("Delete this webhook?")) {
                    deleteWebhook.mutate(hook.id);
                  }
                }}
                pausePending={updateWebhook.isPending}
                deletePending={deleteWebhook.isPending}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">API keys</h2>
        <p className="text-sm text-slate-500">
          Authenticate workspace API calls with header{" "}
          <code className="text-[11px]">X-Api-Key: fp_live_…</code>. Keys are
          scoped to this workspace and use the creator&apos;s permissions.
        </p>

        <form
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
          onSubmit={(e) => {
            e.preventDefault();
            if (!keyName.trim()) return;
            createApiKey.mutate(
              { name: keyName.trim() },
              {
                onSuccess: (data) => {
                  setKeyName("");
                  setRevealedKey(data.key);
                  setCopied(false);
                },
              },
            );
          }}
        >
          <div>
            <Label htmlFor="api-key-name">Key name</Label>
            <Input
              id="api-key-name"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="CI deploy"
              maxLength={100}
            />
          </div>
          {createApiKey.error instanceof ApiError ? (
            <p className="text-sm text-danger-600">
              {createApiKey.error.message}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={createApiKey.isPending || !keyName.trim()}
          >
            {createApiKey.isPending ? "Creating…" : "Create API key"}
          </Button>
        </form>

        {revealedKey ? (
          <div
            className="rounded-xl border border-success-500/30 bg-success-500/10 p-3 text-sm"
            role="status"
          >
            <p className="text-success-700 dark:text-success-400">
              Copy this key now — it won’t be shown again.
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="flex-1 truncate rounded-lg bg-white/70 px-2 py-1.5 text-xs text-slate-600 dark:bg-zinc-900 dark:text-zinc-300">
                {revealedKey}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(revealedKey);
                  setCopied(true);
                }}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy key
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : null}

        {keysLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : apiKeys.length === 0 ? (
          <EmptyState
            title="No API keys"
            description="Create a key for scripts and external tools."
          />
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {apiKeys.map((key) => (
              <li
                key={key.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-slate-900 dark:text-zinc-50">
                    {key.name}
                  </p>
                  <p className="font-mono text-xs text-slate-400">
                    {key.keyPrefix}…
                    {key.revokedAt ? " · revoked" : ""}
                    {" · last used "}
                    {formatWhen(key.lastUsedAt)}
                  </p>
                </div>
                {!key.revokedAt ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger-600"
                    disabled={revokeApiKey.isPending}
                    onClick={() => {
                      if (window.confirm(`Revoke “${key.name}”?`)) {
                        revokeApiKey.mutate(key.id);
                      }
                    }}
                  >
                    Revoke
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
