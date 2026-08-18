import { describe, expect, it } from "vitest";

import { formatDisplayAmount, formatRelativeDate, shortenAddress } from "./formatters";

describe("formatDisplayAmount", () => {
  it("groups a payout", () => {
    expect(formatDisplayAmount(1234567.5)).toBe("1,234,567.5");
  });

  it("never writes NaN into a money column", () => {
    expect(formatDisplayAmount(Number.NaN)).toBe("—");
    expect(formatDisplayAmount(Number.POSITIVE_INFINITY)).toBe("—");
  });
});

describe("formatRelativeDate", () => {
  it("formats a real timestamp", () => {
    expect(formatRelativeDate(new Date("2026-07-01T09:30:00.000Z"))).toContain("Jul");
  });

  it("returns a placeholder instead of throwing on an invalid date", () => {
    expect(() => formatRelativeDate(new Date("not-a-date"))).not.toThrow();
    expect(formatRelativeDate(new Date("not-a-date"))).toBe("Unknown date");
  });
});

describe("shortenAddress", () => {
  it("keeps both ends of a long key", () => {
    expect(shortenAddress("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB")).toBe("GAAA...AAAB");
  });

  it("leaves a short value alone", () => {
    expect(shortenAddress("GABC1234")).toBe("GABC1234");
  });

  it("says so when there is no address", () => {
    expect(shortenAddress("")).toBe("Unavailable");
  });
});
