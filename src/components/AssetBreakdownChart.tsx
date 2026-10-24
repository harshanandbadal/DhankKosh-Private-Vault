"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { usePrivacy } from "@/context/PrivacyContext";
import { formatINR } from "@/lib/formatters";
import { PieChart as PieIcon } from "lucide-react";

export default function AssetBreakdownChart({
  data = [],
}: {
  data?: {
    name: string;
    value: number;
    percentage: number;
    color: string;
  }[];
}) {
  const { isPrivate } = usePrivacy();

  const chartData =
    data && data.length > 0 && data.some((d) => d.value > 0)
      ? data
      : [
          { name: "Bank", value: 2920000, percentage: 63, color: "#3B82F6" },
          { name: "P2P (Receivables)", value: 235000, percentage: 5, color: "#10B981" },
          { name: "Credit / Gift Cards", value: 24000, percentage: 1, color: "#F59E0B" },
          { name: "Physical Cash", value: 450000, percentage: 31, color: "#EC4899" },
        ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-2.5 rounded-xl bg-slate-900 border border-white/20 shadow-xl text-xs">
          <div className="font-semibold text-white">{item.name}</div>
          <div className="text-amber-400 font-mono font-bold mt-0.5">
            {formatINR(item.value, isPrivate)} ({item.percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="vault-glass rounded-2xl p-5 border border-white/10 shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center space-x-2 pb-2 border-b border-white/5">
        <PieIcon className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Asset Breakdown
        </h3>
      </div>

      {/* Donut Chart & Legend Side by Side */}
      <div className="flex items-center justify-between gap-4 mt-2">
        {/* Donut PieChart */}
        <div className="w-36 h-36 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={56}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 overflow-hidden">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300 truncate">{item.name}</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px] shrink-0 font-medium">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
