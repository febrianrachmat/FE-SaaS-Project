"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { workspaceApi } from "../api/workspace.api";
import { useWorkspaceStore } from "../stores/workspace-store";
import type {
  CreateWorkspaceInput,
  InviteMemberInput,
  UpdateWorkspaceInput,
} from "../schemas/workspace.schema";

export const workspaceKeys = {
  all: ["workspaces"] as const,
  detail: (slug: string) => ["workspaces", slug] as const,
  members: (slug: string) => ["workspaces", slug, "members"] as const,
};

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: () => workspaceApi.list(),
  });
}

export function useWorkspace(slug: string) {
  return useQuery({
    queryKey: workspaceKeys.detail(slug),
    queryFn: () => workspaceApi.get(slug),
    enabled: !!slug,
  });
}

export function useWorkspaceMembers(slug: string) {
  return useQuery({
    queryKey: workspaceKeys.members(slug),
    queryFn: () => workspaceApi.listMembers(slug),
    enabled: !!slug,
  });
}

export function useCreateWorkspace() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  return useMutation({
    mutationFn: (payload: CreateWorkspaceInput) => workspaceApi.create(payload),
    onSuccess: (workspace) => {
      setActiveWorkspace(workspace);
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      router.push(`/app/w/${workspace.slug}`);
    },
  });
}

export function useUpdateWorkspace(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateWorkspaceInput) =>
      workspaceApi.update(slug, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(slug) });
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useInviteMember(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteMemberInput) =>
      workspaceApi.invite(slug, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(slug),
      });
    },
  });
}

export function useRemoveMember(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => workspaceApi.removeMember(slug, memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(slug),
      });
    },
  });
}

export function useAcceptInvitation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  return useMutation({
    mutationFn: (token: string) => workspaceApi.acceptInvitation(token),
    onSuccess: (data) => {
      setActiveWorkspace(data.workspace);
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      router.push(`/app/w/${data.workspace.slug}`);
    },
  });
}
