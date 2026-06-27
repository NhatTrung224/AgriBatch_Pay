import {
  BASE_FEE,
  Contract,
  TransactionBuilder,
  rpc,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";

import type { WalletAdapter } from "@/features/wallets/types";
import { getSorobanNetworkPassphrase, getSorobanRpcServer } from "@/lib/soroban/network";

type SorobanWalletContext = {
  adapter: WalletAdapter;
  publicKey: string;
};

type InvokeSorobanContractArgs = {
  args: xdr.ScVal[];
  contractId: string;
  method: string;
  wallet: SorobanWalletContext;
};

export type SorobanInvocationReceipt<T = unknown> = {
  contractId: string;
  hash: string;
  method: string;
  returnValue: T | null;
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForTransaction(
  server: rpc.Server,
  hash: string,
) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const response = await server.getTransaction(hash);

    if (response.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return response;
    }

    if (response.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Soroban transaction ${hash} failed on-chain.`);
    }

    await wait(1500);
  }

  return null;
}

export async function invokeSorobanContract<T>({
  args,
  contractId,
  method,
  wallet,
}: InvokeSorobanContractArgs): Promise<SorobanInvocationReceipt<T>> {
  const server = getSorobanRpcServer();
  const networkPassphrase = getSorobanNetworkPassphrase();
  const sourceAccount = await server.getAccount(wallet.publicKey);
  const prepared = await server.prepareTransaction(
    new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(new Contract(contractId).call(method, ...args))
      .setTimeout(30)
      .build(),
  );

  const signedXdr = await wallet.adapter.signTransaction(prepared.toXDR(), {
    address: wallet.publicKey,
    networkPassphrase,
  });
  const signed = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
  const submission = await server.sendTransaction(signed);

  if (submission.status === "ERROR") {
    throw new Error(`Soroban RPC rejected ${method} for contract ${contractId}.`);
  }

  if (submission.status === "TRY_AGAIN_LATER") {
    throw new Error("Soroban RPC asked the client to retry later.");
  }

  const finalResult = await waitForTransaction(server, submission.hash);

  return {
    contractId,
    hash: submission.hash,
    method,
    returnValue: finalResult?.returnValue
      ? (scValToNative(finalResult.returnValue) as T)
      : null,
  };
}
