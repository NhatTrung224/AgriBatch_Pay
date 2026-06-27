import { StrKey } from "@stellar/stellar-sdk";

export function isValidStellarPublicKey(value: string) {
  return StrKey.isValidEd25519PublicKey(value);
}
