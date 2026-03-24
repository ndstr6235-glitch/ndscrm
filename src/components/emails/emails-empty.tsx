import { Mail } from "lucide-react";

export default function EmailsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-4">
        <Mail size={24} className="text-gold" />
      </div>
      <h3 className="font-display text-base font-semibold text-text mb-1">
        Žádní klienti
      </h3>
      <p className="text-sm text-text-dim max-w-xs">
        Zatím nemáte žádné klienty, kterým byste mohli poslat email.
      </p>
    </div>
  );
}
