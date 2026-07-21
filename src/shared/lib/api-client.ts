import { API_URL } from "@/config/env";
import { ApiError, type ApiResponse } from "@/shared/types/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers, signal } = options;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    signal,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    const error = !payload.success
      ? payload.error
      : { code: "UNKNOWN", message: "Request failed" };

    throw new ApiError(error.message, {
      code: error.code,
      status: response.status,
      details: "details" in error ? error.details : undefined,
    });
  }

  return payload.data;
}
