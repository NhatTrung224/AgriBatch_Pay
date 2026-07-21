import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  getNetworkDetails,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OnboardingWorkspace } from "./onboarding-workspace";

vi.mock("@stellar/freighter-api", () => ({
  getNetworkDetails: vi.fn(),
  isConnected: vi.fn(),
  requestAccess: vi.fn(),
  signTransaction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const publicKey = "GCFREIGHTERUSERTESTNETWALLET0000000000000000000000001";

describe("OnboardingWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Reflect.deleteProperty(window, "freighter");

    vi.mocked(isConnected).mockResolvedValue({ isConnected: true });
    vi.mocked(requestAccess).mockResolvedValue({ address: publicKey });
    vi.mocked(getNetworkDetails).mockResolvedValue({
      network: "testnet",
      networkPassphrase: "Test SDF Network ; September 2015",
      networkUrl: "https://horizon-testnet.stellar.org",
      sorobanRpcUrl: "https://soroban-testnet.stellar.org",
    });
    vi.mocked(signTransaction).mockResolvedValue({
      signedTxXdr: "signed-xdr",
      signerAddress: publicKey,
    });
  });

  it("connects Freighter through the SDK when window.freighter is absent", async () => {
    const user = userEvent.setup();

    render(<OnboardingWorkspace />);

    await user.click(screen.getByRole("button", { name: /connect wallet/i }));

    await waitFor(() => {
      expect(requestAccess).toHaveBeenCalled();
      expect(screen.getByText(publicKey)).toBeInTheDocument();
    });
    expect(toast.error).not.toHaveBeenCalledWith(
      expect.stringMatching(/not installed/i),
    );
  });
});
