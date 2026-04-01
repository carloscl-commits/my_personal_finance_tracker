'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataPoint { name: string; income: number; expenses: number; }

export default function ReportBarChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.6} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
          tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} width={50}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-color)',
            borderRadius: '12px', fontSize: '12px', boxShadow: 'var(--shadow-elevated)', padding: '10px 14px',
          }}
          formatter={(value) => [`$${Number(value).toFixed(2)}`, '']}
        />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
        <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
        <Bar dataKey="expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
}
