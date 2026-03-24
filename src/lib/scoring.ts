import type { ClientScore } from "./types";

interface ScoringInput {
  totalDeposit: number;
  paymentCount: number;
  createdAt: string | Date;
}

export function calculateScore(input: ScoringInput): ClientScore {
  const { totalDeposit, paymentCount, createdAt } = input;

  // No payments = prospect
  if (paymentCount === 0) return "D";

  const monthsActive = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  // A: 1M+ deposit, 6+ months, 3+ payments (regular)
  if (totalDeposit >= 1_000_000 && monthsActive >= 6 && paymentCount >= 3) return "A";

  // B: 300k-1M deposit, 3+ months
  if (totalDeposit >= 300_000 && monthsActive >= 3) return "B";

  // C: has deposits but below thresholds
  return "C";
}
