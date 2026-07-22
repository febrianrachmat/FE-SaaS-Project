"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import { ApiError } from "@/shared/types/api";
import { useAuthStore } from "../stores/auth-store";
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordFormInput,
  type UpdateProfileFormInput,
} from "../schemas/auth.schema";
import {
  useChangePassword,
  useNotificationPrefs,
  useUpdateNotificationPrefs,
  useUpdateProfile,
} from "../hooks/use-auth";
import type { NotificationPrefs } from "../api/auth.api";

const PREF_LABELS: Array<{ key: keyof NotificationPrefs; label: string }> = [
  { key: "emailEnabled", label: "Email notifications" },
  { key: "inAppEnabled", label: "In-app notifications" },
  { key: "taskAssigned", label: "Task assigned to me" },
  { key: "taskUpdated", label: "Task updates" },
  { key: "commentAdded", label: "New comments" },
  { key: "mention", label: "Mentions" },
  { key: "invitation", label: "Workspace invitations" },
  { key: "dueSoon", label: "Upcoming due dates" },
  { key: "completed", label: "Task completed" },
];

export function AccountSettingsPanel() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const prefsQuery = useNotificationPrefs();
  const updatePrefs = useUpdateNotificationPrefs();
  const { setTheme } = useTheme();

  const profileForm = useForm<UpdateProfileFormInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
      bio: "",
      avatarUrl: "",
      timezone: "UTC",
      locale: "en",
      theme: "system",
    },
  });

  const passwordForm = useForm<ChangePasswordFormInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      name: user.name,
      bio: user.bio ?? "",
      avatarUrl: user.avatarUrl ?? "",
      timezone: user.timezone || "UTC",
      locale: user.locale || "en",
      theme: (user.theme as "system" | "light" | "dark") || "system",
    });
  }, [user, profileForm]);

  if (!user) {
    return <Skeleton className="h-64 w-full max-w-2xl" />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Account settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Profile, appearance, notifications, and security for {user.email}
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-zinc-300">
          Profile
        </h2>
        <form
          className="space-y-4"
          noValidate
          onSubmit={profileForm.handleSubmit(async (values) => {
            try {
              const updated = await updateProfile.mutateAsync(values);
              setTheme(updated.theme || "system");
            } catch {
              // shown below
            }
          })}
        >
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...profileForm.register("name")} />
            {profileForm.formState.errors.name ? (
              <p className="mt-1 text-xs text-danger-600">
                {profileForm.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Input id="bio" {...profileForm.register("bio")} />
          </div>
          <div>
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input id="avatarUrl" {...profileForm.register("avatarUrl")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" {...profileForm.register("timezone")} />
            </div>
            <div>
              <Label htmlFor="locale">Locale</Label>
              <Input id="locale" {...profileForm.register("locale")} />
            </div>
          </div>
          <div>
            <Label htmlFor="theme">Theme</Label>
            <select
              id="theme"
              className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              {...profileForm.register("theme")}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          {updateProfile.error instanceof ApiError ? (
            <p className="text-sm text-danger-600">
              {updateProfile.error.message}
            </p>
          ) : null}
          {updateProfile.isSuccess ? (
            <p className="text-sm text-success-600">Profile saved.</p>
          ) : null}
          <Button
            type="submit"
            disabled={
              !profileForm.formState.isDirty || updateProfile.isPending
            }
          >
            {updateProfile.isPending ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-zinc-300">
          Notifications
        </h2>
        {prefsQuery.isLoading ? <Skeleton className="h-40 w-full" /> : null}
        {prefsQuery.data ? (
          <ul className="space-y-3">
            {PREF_LABELS.map(({ key, label }) => (
              <li key={key} className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-700 dark:text-zinc-300">
                  {label}
                </span>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  checked={prefsQuery.data[key]}
                  disabled={updatePrefs.isPending}
                  onChange={(e) => {
                    void updatePrefs.mutateAsync({ [key]: e.target.checked });
                  }}
                />
              </li>
            ))}
          </ul>
        ) : null}
        {updatePrefs.error instanceof ApiError ? (
          <p className="text-sm text-danger-600">{updatePrefs.error.message}</p>
        ) : null}
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-zinc-300">
          Security
        </h2>
        {user.hasPassword === false ? (
          <p className="text-sm text-slate-500">
            This account signs in with Google and does not use a password.
          </p>
        ) : (
          <form
            className="space-y-4"
            noValidate
            onSubmit={passwordForm.handleSubmit(async (values) => {
              try {
                await changePassword.mutateAsync({
                  currentPassword: values.currentPassword,
                  newPassword: values.newPassword,
                });
                passwordForm.reset();
              } catch {
                // shown below
              }
            })}
          >
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...passwordForm.register("currentPassword")}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register("newPassword")}
              />
              {passwordForm.formState.errors.newPassword ? (
                <p className="mt-1 text-xs text-danger-600">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register("confirmPassword")}
              />
              {passwordForm.formState.errors.confirmPassword ? (
                <p className="mt-1 text-xs text-danger-600">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
            {changePassword.error instanceof ApiError ? (
              <p className="text-sm text-danger-600">
                {changePassword.error.message}
              </p>
            ) : null}
            {changePassword.isSuccess ? (
              <p className="text-sm text-success-600">Password updated.</p>
            ) : null}
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? "Updating…" : "Change password"}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
