"use client";

import { AreaChart, Area, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";

export default function ForumStats({
  data,
}: {
  data: Array<{ day: string; threads: number; posts: number; active_users: number }>;
}) {
  return (
    <div className="w-full h-64 rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-2 font-semibold">Actividad (últimos días)</div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopOpacity={0.6} />
              <stop offset="95%" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="threads" name="Hilos" strokeWidth={2} fillOpacity={1} fill="url(#g1)" />
          <Area type="monotone" dataKey="posts" name="Respuestas" strokeWidth={2} fillOpacity={0.6} />
          <Area type="monotone" dataKey="active_users" name="Usuarios activos" strokeWidth={2} fillOpacity={0.4} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
