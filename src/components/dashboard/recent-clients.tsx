import { fmtCZK } from "@/lib/utils";

interface ClientItem {
  id: string;
  name: string;
  isInvestor: boolean;
  totalDeposit: number;
}

interface RecentClientsProps {
  clients: ClientItem[];
}

export default function RecentClients({ clients }: RecentClientsProps) {
  return (
    <div className="bg-surface rounded-2xl shadow-card p-4 lg:p-5">
      <h2 className="text-sm font-semibold text-text mb-3">
        Poslední klienti
      </h2>
      {clients.length === 0 ? (
        <p className="text-sm text-text-dim py-4 text-center">
          Zatím žádní klienti
        </p>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => {
            const initials = client.name
              .split(" ")
              .map((w) => w[0])
              .join("");
            return (
              <div key={client.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sapphire/10 flex items-center justify-center text-xs font-bold text-sapphire shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {client.name}
                  </p>
                  <p className="text-xs text-text-dim">
                    {client.isInvestor
                      ? fmtCZK(client.totalDeposit)
                      : "Prospekt"}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-[20px] ${
                    client.isInvestor
                      ? "bg-emerald-pale text-emerald"
                      : "bg-amber-pale text-amber"
                  }`}
                >
                  {client.isInvestor ? "Investor" : "Prospekt"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
