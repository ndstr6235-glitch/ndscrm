import { cn } from "@/lib/utils";

interface ClientStatusBadgeProps {
  isInvestor: boolean;
}

export default function ClientStatusBadge({ isInvestor }: ClientStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        isInvestor
          ? "bg-emerald-pale text-emerald border border-emerald-border"
          : "bg-sapphire-pale text-sapphire border border-sapphire-border"
      )}
    >
      {isInvestor ? "Investor" : "Prospect"}
    </span>
  );
}
