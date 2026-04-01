'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DataPoint {
  name: string;
  income: number;
  expenses: number;
}

interface Props {
  data: DataPoint[];
}

export default function ReportBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
          axisLine={{ stroke: 'var(--color-border)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value) => [`$${Number(value).toFixed(2)}`, '']}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
        />
        <Bar dataKey="income" fill="#059669" radius={[4, 4, 0, 0]} name="Income" />
        <Bar dataKey="expenses" fill="#dc2626" radius={[4, 4, 0, 0]} name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
}
