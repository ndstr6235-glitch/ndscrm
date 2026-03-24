import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names (clsx + tailwind-merge) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format value as CZK currency — "500 000 Kč" */
export function fmtCZK(value: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format date — "15. 2. 2026" */
export function fmtDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("cs-CZ");
}

/** Format date + time — "15. 02. 2026 10:30" */
export function fmtDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Generate a random ID */
export function generateId(): string {
  return crypto.randomUUID();
}
