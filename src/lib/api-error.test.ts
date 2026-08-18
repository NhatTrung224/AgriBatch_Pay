import { describe, expect, it } from "vitest";
import { z, ZodError } from "zod";

import { ApiError, apiError } from "./api-error";

describe("apiError", () => {
  it("passes a rejected request through with its own message and status", async () => {
    const response = apiError(new ApiError("Batch is already funded or settled."), "Unable to fund batch.");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Batch is already funded or settled.",
    });
  });

  it("keeps the status a rejection asked for", async () => {
    expect(apiError(new ApiError("Batch B-1 was not found.", 404), "x").status).toBe(404);
    expect(apiError(new ApiError("Batch B-1 already exists.", 409), "x").status).toBe(409);
  });

  it("reports the first validation issue so the form can be corrected", async () => {
    let issue: ZodError | undefined;

    try {
      z.object({ weightKg: z.number().positive("Weight must be positive.") }).parse({ weightKg: -1 });
    } catch (error) {
      issue = error as ZodError;
    }

    const response = apiError(issue, "Unable to add lot.");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Weight must be positive." });
  });

  it("hides the detail of an unexpected fault behind the caller's fallback", async () => {
    const response = apiError(
      new Error('duplicate key value violates unique constraint "batches_pkey" on host db-prod-1'),
      "Unable to create batch.",
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Unable to create batch." });
  });

  it("handles a thrown value that is not an Error at all", async () => {
    const response = apiError("something odd", "Unable to complete this action.");

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to complete this action.",
    });
  });
});
