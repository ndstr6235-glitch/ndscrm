import { RefreshCw, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8 bg-gradient-to-br from-sidebar to-[#1a1f2e]">
      <div className="w-full max-w-[400px] text-center animate-fade-in">
        {/* Logo */}
        <div className="w-14 h-14 mx-auto rounded-[11px] bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-2xl font-bold text-white mb-6 shadow-lg">
          &#x20bf;
        </div>

        {/* Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-white/[0.06] flex items-center justify-center mb-6">
          <WifiOff size={28} className="text-white/40" />
        </div>

        {/* Text */}
        <h1 className="font-display text-xl font-bold text-white mb-2">
          Jste offline
        </h1>
        <p className="text-sm text-white/50 leading-relaxed mb-8">
          Build Fund CRM potřebuje připojení k internetu.
          <br />
          Zkontrolujte připojení a zkuste to znovu.
        </p>

        {/* Retry */}
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          <RefreshCw size={16} />
          Zkusit znovu
        </a>
      </div>
    </div>
  );
}
