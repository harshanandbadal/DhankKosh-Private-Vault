"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePrivacy } from "@/context/PrivacyContext";
import { formatINR } from "@/lib/formatters";
import { TrendingUp } from "lucide-react";

export default function NetGrowthChart({
  growthData = [],
  netWorth = 2829000,
}: {
  growthData?: any[];
  netWorth?: number;
}) {
  const { isPrivate } = usePrivacy();
  const [activePill, setActivePill] = useState("1Y");

  const PILLS = ["1D", "7D", "1M", "3M", "6M", "9M", "1Y"];

  // Filter or scale points based on selected timeframe pill
  const getFilteredData = () => {
    if (!growthData || growthData.length === 0) {
      return [
        { period: "Jan", netWorth: netWorth * 0.7 },
        { period: "Feb", netWorth: netWorth * 0.75 },
        { period: "Mar", netWorth: netWorth * 0.8 },
        { period: "Apr", netWorth: netWorth * 0.82 },
        { period: "May", netWorth: netWorth * 0.88 },
        { period: "Jun", netWorth: netWorth * 0.92 },
        { period: "Jul", netWorth: netWorth * 0.95 },
        { period: "Aug", netWorth: netWorth * 0.98 },
        { period: "Sep", netWorth: netWorth * 0.99 },
        { period: "Oct", netWorth: netWorth },
      ];
    }

    if (activePill === "1D") {
      return [
        { period: "09:00", netWorth: netWorth * 0.995 },
        { period: "12:00", netWorth: netWorth * 0.998 },
        { period: "15:00", netWorth: netWorth * 0.999 },
        { period: "18:00", netWorth: netWorth },
      ];
    }
    if (activePill === "7D") {
      return growthData.slice(-4).map((d, i) => ({ ...d, period: `Day ${i + 1}` }));
    }
    if (activePill === "1M") {
      return growthData.slice(-4);
    }
    if (activePill === "3M") {
      return growthData.slice(-6);
    }
    return growthData;
  };

  const chartData = getFilteredData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-slate-900/95 border border-white/20 shadow-xl text-xs">
          <div className="text-slate-400 font-medium mb-1">{label}</div>
          <div className="text-sm font-bold text-cyan-400 font-mono">
            {formatINR(payload[0].value, isPrivate)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="vault-glass rounded-2xl p-5 border border-white/10 shadow-2xl flex flex-col justify-between">
      {/* Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Net Growth Chart
          </h3>
        </div>

        {/* Timeframe pills */}
        <div className="flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-white/10 overflow-x-auto">
          {PILLS.map((pill) => (
            <button
              key={pill}
              onClick={() => setActivePill(pill)}
              className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all ${
                activePill === pill
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* AreaChart */}
      <div className="h-48 w-full mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="period"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${Math.round(v / 100000)}L`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="#06B6D4"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#cyanGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
