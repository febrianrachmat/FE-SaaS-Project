import { API_URL } from "@/config/env";
import { ApiError, type ApiResponse } from "@/shared/types/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

async function parseJsonSafe(response: Response): Promise<ApiResponse<unknown> | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiResponse<unknown>;
  } catch {
    return null;
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const result = await apiClientWithMeta<T>(path, options);
  return result.data;
}

export type PaginatedMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

export async function apiClientWithMeta<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta: PaginatedMeta | null }> {
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

  const payload = await parseJsonSafe(response);

  if (!response.ok || !payload || !payload.success) {
    const error =
      payload && !payload.success
        ? payload.error
        : { code: "UNKNOWN", message: "Request failed" };

    throw new ApiError(error.message, {
      code: error.code,
      status: response.status,
      details: "details" in error ? error.details : undefined,
    });
  }

  return {
    data: payload.data as T,
    meta: payload.meta ?? null,
  };
}
