"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthBootstrap } from "../hooks/use-auth";
import { useAuthStore } from "../stores/auth-store";
import { Skeleton } from "@/shared/ui/skeleton";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  useAuthBootstrap();
  const theme = useAuthStore((s) => s.user?.theme);
  const { setTheme } = useTheme();

  useEffect(() => {
    if (theme === "light" || theme === "dark" || theme === "system") {
      setTheme(theme);
    }
  }, [theme, setTheme]);

  return <>{children}</>;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return <>{children}</>;
}
