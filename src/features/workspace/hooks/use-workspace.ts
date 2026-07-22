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
  invitations: (slug: string) => ["workspaces", slug, "invitations"] as const,
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
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.invitations(slug),
      });
    },
  });
}

export function usePendingInvitations(slug: string, enabled = true) {
  return useQuery({
    queryKey: workspaceKeys.invitations(slug),
    queryFn: () => workspaceApi.listInvitations(slug),
    enabled: !!slug && enabled,
  });
}

export function useRevokeInvitation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      workspaceApi.revokeInvitation(slug, invitationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.invitations(slug),
      });
    },
  });
}

export function useResendInvitation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      workspaceApi.resendInvitation(slug, invitationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.invitations(slug),
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

export function useUpdateMemberRole(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      role: "GUEST" | "MEMBER" | "PROJECT_MANAGER" | "ADMIN";
    }) => workspaceApi.updateMemberRole(slug, memberId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(slug),
      });
    },
  });
}

export function useArchiveWorkspace(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => workspaceApi.archive(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.detail(slug),
      });
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useUnarchiveWorkspace(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => workspaceApi.unarchive(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.detail(slug),
      });
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useTransferOwnership(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newOwnerId: string) => workspaceApi.transfer(slug, newOwnerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.detail(slug),
      });
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(slug),
      });
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useDeleteWorkspace(slug: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  return useMutation({
    mutationFn: () => workspaceApi.delete(slug),
    onSuccess: () => {
      setActiveWorkspace(null);
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      router.push("/app");
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  return useMutation({
    mutationFn: (token: string) => workspaceApi.acceptInvitation(token),
    onSuccess: (data) => {
      setActiveWorkspace(data.workspace);
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useInvitationPreview(token: string) {
  return useQuery({
    queryKey: ["invitation-preview", token],
    queryFn: () => workspaceApi.previewInvitation(token),
    enabled: token.length >= 20,
    retry: false,
  });
}
