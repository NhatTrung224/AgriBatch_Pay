"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import type { Route } from "next";
import Link from "next/link";
import { useDeferredValue, useState } from "react";

import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { formatDisplayAmount, formatRelativeDate, shortenAddress } from "@/lib/formatters";
import type { BatchSelect } from "@/lib/db/schema";

type BatchesDirectoryProps = {
  items: Array<BatchSelect>;
};

export function BatchesDirectory({ items }: BatchesDirectoryProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BatchSelect["status"] | "ALL">("ALL");
  const deferredQuery = useDeferredValue(query);

  const filteredItems = items.filter((item) => {
    const matchesQuery =
      !deferredQuery ||
      item.id.toLowerCase().includes(deferredQuery.toLowerCase()) ||
      item.cropType.toLowerCase().includes(deferredQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(deferredQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const statuses = Array.from(new Set(items.map((item) => item.status)));

  return (
    <div className="space-y-4">
      <section className="panel px-5 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-slate-300">
              Batch registry
            </span>
            <h1 className="mt-4 font-display text-[3rem] tracking-[-0.06em] text-white">
              Search settlement batches and open the next operational step.
            </h1>
          </div>
          <ButtonLink href="/batches/new" variant="primary">
            Create Crop Batch
          </ButtonLink>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="flex h-12 items-center gap-3 rounded-full border border-white/10 bg-white/4 px-4">
            <MagnifyingGlass size={18} className="text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by batch ID, crop type, or location"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={statusFilter === "ALL"}
              onClick={() => setStatusFilter("ALL")}
              label="All"
            />
            {statuses.map((status) => (
              <FilterButton
                key={status}
                active={statusFilter === status}
                onClick={() => setStatusFilter(status)}
                label={status.replaceAll("_", " ")}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="panel px-5 py-6 lg:px-8">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-2 py-3 font-medium">Batch</th>
                <th className="px-2 py-3 font-medium">Counterparties</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="px-2 py-3 font-medium">Total</th>
                <th className="px-2 py-3 font-medium">Updated</th>
                <th className="px-2 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-t border-white/8 text-sm">
                  <td className="px-2 py-4">
                    <p className="font-medium text-white">{item.id}</p>
                    <p className="mt-1 text-slate-400">
                      {item.cropType} · {item.season}
                    </p>
                  </td>
                  <td className="px-2 py-4 text-slate-300">
                    <p>{shortenAddress(item.cooperativeWallet)}</p>
                    <p className="mt-1 text-slate-500">
                      {shortenAddress(item.buyerWallet)}
                    </p>
                  </td>
                  <td className="px-2 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-2 py-4 text-slate-300">
                    {formatDisplayAmount(item.totalAmount)}
                  </td>
                  <td className="px-2 py-4 text-slate-500">
                    {formatRelativeDate(item.updatedAt)}
                  </td>
                  <td className="px-2 py-4">
                    <Link
                      href={`/batches/${item.id}` as Route}
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/8 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100"
                    >
                      Open batch
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filteredItems.length ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-white/12 bg-white/3 px-6 py-10 text-center">
            <p className="font-display text-2xl tracking-[-0.04em] text-white">
              No batches match the current filter.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Clear the query or create a new crop batch to continue.
            </p>
            <ButtonLink href="/batches/new" variant="ghost" className="mt-5">
              Create Crop Batch
            </ButtonLink>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick(): void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${
        active
          ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
          : "border-white/10 bg-white/4 text-slate-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
