"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ApiError } from "@/shared/types/api";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../stores/auth-store";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "../schemas/auth.schema";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useAuthBootstrap() {
  const { setUser, setStatus, clear } = useAuthStore();
  const query = useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          try {
            const refreshed = await authApi.refresh();
            return refreshed.user;
          } catch {
            return null;
          }
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.isLoading) {
      setStatus("loading");
      return;
    }
    if (query.data) {
      setUser(query.data);
    } else if (query.isFetched) {
      clear();
    }
  }, [query.data, query.isLoading, query.isFetched, setUser, setStatus, clear]);

  return query;
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: LoginInput) => authApi.login(payload),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(authKeys.me, data.user);
      router.push("/app");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterInput) => authApi.register(payload),
    onSuccess: (data) => {
      const needsVerify = /verify/i.test(data.message);
      router.push(
        needsVerify ? "/login?registered=verify" : "/login?registered=1",
      );
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clear = useAuthStore((s) => s.clear);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clear();
      queryClient.removeQueries({ queryKey: authKeys.me });
      router.push("/login");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordInput) =>
      authApi.forgotPassword(payload),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ResetPasswordInput) =>
      authApi.resetPassword({
        token: payload.token,
        password: payload.password,
      }),
    onSuccess: () => {
      router.push("/login?reset=1");
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
  });
}
