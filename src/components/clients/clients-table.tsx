"use client";

import { ChevronRight } from "lucide-react";
import { fmtCZK, fmtDate } from "@/lib/utils";
import ClientStatusBadge from "./client-status-badge";
import type { ClientRow } from "./clients-page-client";

interface ClientsTableProps {
  clients: ClientRow[];
  isBroker: boolean;
  onClientClick: (id: string) => void;
}

export default function ClientsTable({
  clients,
  isBroker,
  onClientClick,
}: ClientsTableProps) {
  return (
    <div className="hidden md:block bg-surface rounded-[16px] border border-border shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-hover/50">
              <th className="text-left font-medium text-text-mid px-4 py-3">
                Klient
              </th>
              <th className="text-left font-medium text-text-mid px-4 py-3 hidden lg:table-cell">
                Kontakt
              </th>
              <th className="text-left font-medium text-text-mid px-4 py-3 hidden xl:table-cell">
                Datum hovoru
              </th>
              <th className="text-left font-medium text-text-mid px-4 py-3">
                Status
              </th>
              <th className="text-right font-medium text-text-mid px-4 py-3">
                Vklad
              </th>
              <th className="text-right font-medium text-text-mid px-4 py-3 hidden lg:table-cell">
                Výdělek
              </th>
              {!isBroker && (
                <th className="text-left font-medium text-text-mid px-4 py-3 hidden xl:table-cell">
                  Broker
                </th>
              )}
              <th className="w-10 px-2" />
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const initials = `${client.firstName[0]}${client.lastName[0]}`;
              return (
                <tr
                  key={client.id}
                  onClick={() => onClientClick(client.id)}
                  className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors cursor-pointer group"
                >
                  {/* Name + Avatar */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center text-xs font-bold text-gold shrink-0">
                        {initials}
                      </div>
                      <span className="font-medium text-text">
                        {client.firstName} {client.lastName}
                      </span>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="text-text-mid">{client.email}</div>
                    <div className="text-text-dim text-xs">{client.phone}</div>
                  </td>

                  {/* Call date */}
                  <td className="px-4 py-3 text-text-mid hidden xl:table-cell">
                    {fmtDate(client.callDate)}
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-3">
                    <ClientStatusBadge isInvestor={client.isInvestor} />
                  </td>

                  {/* Deposit */}
                  <td className="px-4 py-3 text-right font-medium text-text">
                    {fmtCZK(client.totalDeposit)}
                  </td>

                  {/* Profit */}
                  <td className="px-4 py-3 text-right text-emerald hidden lg:table-cell">
                    {fmtCZK(client.totalProfit)}
                  </td>

                  {/* Broker */}
                  {!isBroker && (
                    <td className="px-4 py-3 text-text-mid hidden xl:table-cell">
                      {client.brokerName}
                    </td>
                  )}

                  {/* Arrow */}
                  <td className="px-2 py-3">
                    <ChevronRight
                      size={16}
                      className="text-text-faint group-hover:text-text-mid transition-colors"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
