import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "@/components/status-badge";

describe("StatusBadge", () => {
  it("renders batch statuses with visible labels", () => {
    render(<StatusBadge status="QUALITY_CONFIRMED" />);

    expect(screen.getByText("QUALITY CONFIRMED")).toBeInTheDocument();
  });
});
