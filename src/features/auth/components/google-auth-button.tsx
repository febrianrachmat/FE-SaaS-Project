"use client";

import { API_URL } from "@/config/env";

export function GoogleAuthButton({ label = "Continue with Google" }: { label?: string }) {
  return (
    <a
      href={`${API_URL}/auth/google`}
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
    >
      <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24">
        <path
          fill="#EA4335"
          d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.7 3.7 14.6 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12S6.9 21.2 12 21.2c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.7H12z"
        />
        <path
          fill="#34A853"
          d="M3.9 7.5 6.9 9.7C7.7 7.7 9.7 6.2 12 6.2c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.7 3.7 14.6 2.8 12 2.8 8.4 2.8 5.3 4.8 3.9 7.5z"
        />
        <path
          fill="#4A90E2"
          d="M12 21.2c2.5 0 4.6-.8 6.1-2.2l-2.9-2.3c-.8.6-1.9 1-3.2 1-3.5 0-6.5-2.4-7.5-5.6l-3 2.3C3.1 18.7 7.2 21.2 12 21.2z"
        />
        <path
          fill="#FBBC05"
          d="M4.5 14.1c-.2-.6-.4-1.3-.4-2.1s.1-1.5.4-2.1l-3-2.3C1.2 9.1.8 10.5.8 12s.4 2.9 1.1 4.2l2.6-2.1z"
        />
      </svg>
      {label}
    </a>
  );
}
