"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { revenueGrowth, subscriptionStatus, tenantGrowth } from "@/lib/platform-demo";
import { formatUgx } from "@/lib/utils";

type RevenuePoint = (typeof revenueGrowth)[number];
type TenantGrowthPoint = (typeof tenantGrowth)[number];
type SubscriptionPoint = (typeof subscriptionStatus)[number];

export function PlatformRevenueChart({ data }: { data: RevenuePoint[] }) {
  const isClient = useIsClient();

  if (!isClient) return <StaticRevenueChart data={data} />;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 16, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="platformRevenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${Number(value) / 1_000_000}M`}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) =>
              name === "revenue"
                ? [formatUgx(Number(value)), "Revenue"]
                : [value, "Tenants"]
            }
          />
          <Area
            dataKey="revenue"
            fill="url(#platformRevenueFill)"
            stroke="#7c3aed"
            strokeWidth={3}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TenantGrowthChart({ data }: { data: TenantGrowthPoint[] }) {
  const isClient = useIsClient();

  if (!isClient) return <StaticTenantGrowthChart data={data} />;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 16, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="hospitals" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
          <Bar dataKey="clinics" fill="#10b981" radius={[6, 6, 0, 0]} />
          <Bar dataKey="pharmacies" fill="#f97316" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SubscriptionStatusChart({ data }: { data: SubscriptionPoint[] }) {
  const isClient = useIsClient();

  if (!isClient) return <StaticSubscriptionStatus data={data} />;

  return (
    <div className="grid gap-4 md:grid-cols-[190px_1fr] md:items-center">
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={54} outerRadius={86} paddingAngle={4}>
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
            <span className="flex items-center gap-3 text-sm font-bold text-slate-700">
              <span className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="text-lg font-bold text-slate-950">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

const tooltipStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
};

function StaticRevenueChart({ data }: { data: RevenuePoint[] }) {
  const max = Math.max(...data.map((item) => item.revenue));
  const points = data
    .map((item, index) => {
      const x = 34 + index * (292 / Math.max(1, data.length - 1));
      const y = 232 - (item.revenue / max) * 178;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="h-72 w-full rounded-lg bg-slate-50 p-4">
      <svg viewBox="0 0 360 250" className="h-full w-full" role="img" aria-label="Revenue growth chart">
        {[54, 98, 142, 186, 230].map((y) => (
          <line key={y} x1="34" x2="340" y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
        ))}
        <polyline points={points} fill="none" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((item, index) => {
          const x = 34 + index * (292 / Math.max(1, data.length - 1));
          const y = 232 - (item.revenue / max) * 178;
          return (
            <g key={item.month}>
              <circle cx={x} cy={y} r="5" fill="#7c3aed" />
              <text x={x} y="246" textAnchor="middle" className="fill-slate-500 text-[10px]">
                {item.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function StaticTenantGrowthChart({ data }: { data: TenantGrowthPoint[] }) {
  const max = Math.max(...data.flatMap((item) => [item.hospitals, item.clinics, item.pharmacies]));

  return (
    <div className="grid h-72 grid-cols-6 items-end gap-3 rounded-lg bg-slate-50 p-4">
      {data.map((item) => (
        <div key={item.month} className="grid h-full items-end gap-2">
          <div className="flex h-[210px] items-end justify-center gap-1.5">
            <span className="w-3 rounded-t bg-sky-500" style={{ height: `${(item.hospitals / max) * 100}%` }} />
            <span className="w-3 rounded-t bg-emerald-500" style={{ height: `${(item.clinics / max) * 100}%` }} />
            <span className="w-3 rounded-t bg-orange-500" style={{ height: `${(item.pharmacies / max) * 100}%` }} />
          </div>
          <p className="text-center text-xs font-semibold text-slate-500">{item.month}</p>
        </div>
      ))}
    </div>
  );
}

function StaticSubscriptionStatus({ data }: { data: SubscriptionPoint[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const stops = data.map((item, index) => {
    const start =
      (data.slice(0, index).reduce((sum, segment) => sum + segment.value, 0) / total) * 100;
    const end = start + (item.value / total) * 100;
    return `${item.color} ${start}% ${end}%`;
  });

  return (
    <div className="grid gap-4 md:grid-cols-[190px_1fr] md:items-center">
      <div className="grid h-52 place-items-center">
        <div
          className="grid size-40 place-items-center rounded-full"
          style={{ background: `conic-gradient(${stops.join(", ")})` }}
        >
          <div className="grid size-24 place-items-center rounded-full bg-white text-center">
            <span className="text-2xl font-bold text-slate-950">{total}</span>
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <span className="flex items-center gap-3 text-sm font-bold text-slate-700">
              <span className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="text-lg font-bold text-slate-950">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
