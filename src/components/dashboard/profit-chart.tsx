"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useTheme } from "@/components/theme/theme-provider";
import type { MonthlyChartData } from "@/app/actions/charts";

function formatCZK(v: number) {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(v);
}

function shortLabel(label: string) {
  return label.split(" ")[0].substring(0, 3);
}

interface Props {
  data: MonthlyChartData[];
}

export default function ProfitChart({ data }: Props) {
  const hasData = data.some((d) => d.profit > 0);
  const { resolved } = useTheme();
  const isDark = resolved === "dark";
  const gridColor = isDark ? "#2a3040" : "#e4e8f0";
  const tickColor = isDark ? "#6b7590" : "#8892aa";

  return (
    <div className="bg-surface rounded-[16px] border border-border p-4 md:p-6 transition-colors duration-200">
      <h3 className="font-display text-sm md:text-base font-bold text-text mb-4">
        Trend výdělků za posledních 6 měsíců
      </h3>
      {!hasData ? (
        <div className="flex items-center justify-center h-[200px] text-text-dim text-sm">
          Zatím žádná data pro zobrazení grafu
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="label"
              tickFormatter={shortLabel}
              tick={{ fontSize: 12, fill: tickColor }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
              tick={{ fontSize: 12, fill: tickColor }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              formatter={(value) => [formatCZK(Number(value ?? 0)), "Výdělek"]}
              labelFormatter={(label) => String(label)}
              contentStyle={{
                borderRadius: 8,
                border: `1px solid ${gridColor}`,
                fontSize: 13,
                backgroundColor: isDark ? "#1a1f2e" : "#ffffff",
                color: isDark ? "#e4e8f0" : "#0f1117",
              }}
            />
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b8912a" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#b8912a" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#b8912a"
              strokeWidth={2}
              fill="url(#goldGrad)"
              dot={{ r: 3, fill: "#b8912a", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#b8912a", strokeWidth: 2, stroke: isDark ? "#1a1f2e" : "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
