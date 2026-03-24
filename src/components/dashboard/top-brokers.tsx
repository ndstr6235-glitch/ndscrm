import { fmtCZK } from "@/lib/utils";
import { Medal } from "lucide-react";

interface BrokerItem {
  name: string;
  totalProfit: number;
  clientCount: number;
}

interface TopBrokersProps {
  brokers: BrokerItem[];
  visible: boolean;
}

const MEDAL_COLORS = ["text-[#FFD700]", "text-[#C0C0C0]", "text-[#CD7F32]"];

export default function TopBrokers({ brokers, visible }: TopBrokersProps) {
  if (!visible) return null;

  return (
    <div className="bg-surface rounded-[16px] shadow-card p-4 lg:p-5 md:col-span-2 lg:col-span-1">
      <h2 className="text-sm font-semibold text-text mb-3">Top brokeři</h2>
      {brokers.length === 0 ? (
        <p className="text-sm text-text-dim py-4 text-center">
          Žádní brokeři
        </p>
      ) : (
        <div className="space-y-3">
          {brokers.map((broker, i) => {
            const initials = broker.name
              .split(" ")
              .map((w) => w[0])
              .join("");
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 text-center shrink-0">
                  {i < 3 ? (
                    <Medal size={18} className={MEDAL_COLORS[i]} />
                  ) : (
                    <span className="text-xs text-text-dim font-medium">
                      {i + 1}.
                    </span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-bold text-gold shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {broker.name}
                  </p>
                  <p className="text-xs text-text-dim">
                    {broker.clientCount} klientů
                  </p>
                </div>
                <span className="text-sm font-semibold text-emerald">
                  {fmtCZK(broker.totalProfit)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
