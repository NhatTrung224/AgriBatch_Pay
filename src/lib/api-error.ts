import { ZodError } from "zod";

/**
 * A failure the caller is meant to read and act on. Anything else reaching
 * `apiError` is a fault: its message can carry the SQL, the column or the
 * connection target, so it belongs in the log rather than the response body.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function apiError(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return Response.json(
      { error: error.issues[0]?.message ?? "Invalid request payload." },
      { status: 400 },
    );
  }

  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  console.error("[api]", fallback, error);
  return Response.json({ error: fallback }, { status: 500 });
}
