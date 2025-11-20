import React, { useId, useMemo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DONUT_COLORS = ["#34d399", "#10b981", "#0ea5e9", "#fbbf24", "#f97316", "#a855f7"];

const defaultValueFormatter = (value) => value.toLocaleString("vi-VN");

function AreaTooltip({ active, payload, label, valueFormatter = defaultValueFormatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-emerald-100/70 bg-white/95 px-4 py-2 text-sm shadow-xl shadow-emerald-900/5">
      <p className="text-xs font-semibold text-emerald-600">{label}</p>
      <p className="text-base font-semibold text-slate-900">{valueFormatter(payload[0].value)}</p>
    </div>
  );
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-slate-900">{item.payload.label}</p>
      <p className="text-xs text-slate-500">
        {item.payload.value.toLocaleString("vi-VN")} ({item.payload.percent}%)
      </p>
    </div>
  );
}

export function InsightAreaChart({
  data = [],
  change = 0,
  title = "Hiệu suất",
  subtitle = "Theo dõi dữ liệu thời gian thực",
  valueFormatter = defaultValueFormatter,
}) {
  const gradientId = `${useId()}-area`;
  const isPositive = change >= 0;

  return (
    <div className="flex flex-1 flex-col rounded-3xl border border-emerald-100/60 bg-gradient-to-br from-white via-emerald-50/60 to-white p-6 shadow-lg shadow-emerald-900/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-500/80">{subtitle}</p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h3>
        </div>
        <Badge
          className={cn(
            "border-0 px-3 py-1 text-sm font-semibold",
            isPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-50 text-rose-600"
          )}
        >
          {isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
          {`${isPositive ? "+" : ""}${Math.round(change * 100)}%`}
        </Badge>
      </div>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="5 5" stroke="#d1fae5" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              tickFormatter={valueFormatter}
              tickLine={false}
              axisLine={false}
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
              width={60}
            />
            <Tooltip content={<AreaTooltip valueFormatter={valueFormatter} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 6, fill: "#10b981", stroke: "white", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SegmentDistributionCard({
  data = [],
  change = 0,
  title = "Phân bổ",
  subtitle = "Các nhóm chính",
}) {
  const normalized = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
    return [...data]
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        percent: Math.round((item.value / total) * 100),
        color: DONUT_COLORS[index % DONUT_COLORS.length],
      }));
  }, [data]);

  const topSegment = normalized[0];
  const isPositive = change >= 0;

  return (
    <div className="flex flex-1 flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-emerald-900/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500/80">
            {subtitle}
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h3>
        </div>
        <Badge
          className={cn(
            "border-0 px-3 py-1 text-sm font-semibold",
            isPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-50 text-rose-600"
          )}
        >
          {isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
          {`${isPositive ? "+" : ""}${Math.round(change * 100)}%`}
        </Badge>
      </div>

      <div className="mt-6 flex flex-col items-center gap-6">
        <div className="relative h-60 w-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={normalized}
                dataKey="value"
                nameKey="label"
                innerRadius={70}
                outerRadius={110}
                strokeWidth={6}
                paddingAngle={4}
              >
                {normalized.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {topSegment && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-2xl bg-white/95 px-4 py-3 text-center shadow-md shadow-emerald-900/10 backdrop-blur">
                <p className="text-xs font-semibold text-slate-500">Chiếm nhiều nhất</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{topSegment.label}</p>
                <p className="text-3xl font-bold text-emerald-600">{topSegment.percent}%</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-3">
          {normalized.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm text-slate-600"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-semibold text-slate-900">{item.label}</span>
              <span className="text-xs text-slate-500">{item.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

