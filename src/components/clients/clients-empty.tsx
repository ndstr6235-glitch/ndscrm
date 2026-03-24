import { Users, UserPlus } from "lucide-react";

interface ClientsEmptyProps {
  hasFilters: boolean;
}

export default function ClientsEmpty({ hasFilters }: ClientsEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
        <Users size={28} className="text-gold" />
      </div>
      <h3 className="font-display text-lg font-semibold text-text mb-1">
        {hasFilters ? "Žádní klienti nenalezeni" : "Zatím nemáte žádné klienty"}
      </h3>
      <p className="text-sm text-text-mid mb-4 max-w-xs">
        {hasFilters
          ? "Zkuste upravit filtry"
          : "Přidejte prvního klienta a začněte"}
      </p>
      {!hasFilters && (
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow">
          <UserPlus size={16} />
          Přidat klienta
        </button>
      )}
    </div>
  );
}
