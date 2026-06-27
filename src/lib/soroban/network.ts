import { Networks, rpc } from "@stellar/stellar-sdk";

import { clientEnv } from "@/lib/env/client";

export function getSorobanNetworkPassphrase() {
  const configuredNetwork = clientEnv.NEXT_PUBLIC_STELLAR_NETWORK.toLowerCase();

  if (configuredNetwork.includes("public") || configuredNetwork.includes("mainnet")) {
    return Networks.PUBLIC;
  }

  return Networks.TESTNET;
}

export function getSorobanRpcServer() {
  return new rpc.Server(clientEnv.NEXT_PUBLIC_STELLAR_RPC_URL);
}
