import { apiClient } from "@/shared/lib/api-client";
import type { User } from "@/shared/types/domain";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "../schemas/auth.schema";

export type AuthMessageResult = {
  message: string;
};

export type RegisterResult = {
  user: User;
  message: string;
};

export type LoginResult = {
  user: User;
};

export type UpdateProfileInput = {
  name?: string;
  bio?: string;
  avatarUrl?: string | null;
  timezone?: string;
  locale?: string;
  theme?: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type NotificationPrefs = {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  taskAssigned: boolean;
  taskUpdated: boolean;
  commentAdded: boolean;
  mention: boolean;
  invitation: boolean;
  dueSoon: boolean;
  completed: boolean;
};

export const authApi = {
  register: (payload: RegisterInput) =>
    apiClient<RegisterResult>("/auth/register", {
      method: "POST",
      body: payload,
    }),

  login: (payload: LoginInput) =>
    apiClient<LoginResult>("/auth/login", {
      method: "POST",
      body: payload,
    }),

  logout: () =>
    apiClient<AuthMessageResult>("/auth/logout", { method: "POST" }),

  refresh: () =>
    apiClient<LoginResult>("/auth/refresh", { method: "POST" }),

  me: () => apiClient<User>("/auth/me"),

  updateProfile: (payload: UpdateProfileInput) =>
    apiClient<User>("/auth/me", {
      method: "PATCH",
      body: payload,
    }),

  changePassword: (payload: ChangePasswordInput) =>
    apiClient<AuthMessageResult>("/auth/change-password", {
      method: "POST",
      body: payload,
    }),

  notificationPrefs: () =>
    apiClient<NotificationPrefs>("/auth/me/notification-preferences"),

  updateNotificationPrefs: (payload: Partial<NotificationPrefs>) =>
    apiClient<NotificationPrefs>("/auth/me/notification-preferences", {
      method: "PATCH",
      body: payload,
    }),

  verifyEmail: (token: string) =>
    apiClient<{ user: User; message: string }>("/auth/verify-email", {
      method: "POST",
      body: { token },
    }),

  forgotPassword: (payload: ForgotPasswordInput) =>
    apiClient<AuthMessageResult>("/auth/forgot-password", {
      method: "POST",
      body: payload,
    }),

  resendVerification: (email: string) =>
    apiClient<AuthMessageResult>("/auth/resend-verification", {
      method: "POST",
      body: { email },
    }),

  resetPassword: (payload: Pick<ResetPasswordInput, "token" | "password">) =>
    apiClient<AuthMessageResult>("/auth/reset-password", {
      method: "POST",
      body: payload,
    }),
};
