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

  resetPassword: (payload: Pick<ResetPasswordInput, "token" | "password">) =>
    apiClient<AuthMessageResult>("/auth/reset-password", {
      method: "POST",
      body: payload,
    }),
};
