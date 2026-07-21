export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  } | null;
  error: null;
};

export type ApiFailure = {
  success: false;
  data: null;
  meta: null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    message: string,
    options: { code: string; status: number; details?: unknown },
  ) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
  }
}
