"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/admin.api";

export const adminKeys = {
  stats: ["admin", "stats"] as const,
  users: ["admin", "users"] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: () => adminApi.stats(),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: () => adminApi.listUsers(),
  });
}

export function useUpdateSystemRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      systemRole,
    }: {
      userId: string;
      systemRole: "USER" | "SYSTEM_ADMIN";
    }) => adminApi.updateSystemRole(userId, systemRole),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.users });
    },
  });
}
