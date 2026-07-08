import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";

import { clientEnv } from "@/lib/env/client";
import { shortenAddress } from "@/lib/formatters";

type TransactionHashLinkProps = {
  className?: string;
  value: string;
};

export function TransactionHashLink({
  className,
  value,
}: TransactionHashLinkProps) {
  return (
    <a
      href={`${clientEnv.NEXT_PUBLIC_EXPLORER_BASE_URL}/tx/${value}`}
      target="_blank"
      rel="noreferrer"
      className={className}
      aria-label={`Open transaction ${value} on Stellar Expert`}
      title={value}
    >
      <span>{shortenAddress(value)}</span>
      <ArrowSquareOut size={16} />
    </a>
  );
}
