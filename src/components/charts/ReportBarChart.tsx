'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataPoint { name: string; income: number; expenses: number; }

export default function ReportBarChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border-color)"
          strokeOpacity={0.5}
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
          width={52}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            boxShadow: 'var(--shadow-elevated)',
            padding: '10px 14px',
          }}
          formatter={(value) => [`$${Number(value).toFixed(2)}`, '']}
        />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
        <Bar dataKey="income" fill="var(--income)" radius={[4, 4, 0, 0]} name="Income" />
        <Bar dataKey="expenses" fill="var(--expense)" radius={[4, 4, 0, 0]} name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
}
