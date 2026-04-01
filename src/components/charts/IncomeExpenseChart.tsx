'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/types/finance';
import { format, subMonths, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface Props { transactions: Transaction[]; months?: number; }

export default function IncomeExpenseChart({ transactions, months = 6 }: Props) {
  const now = new Date();
  const data = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    let income = 0, expenses = 0;
    for (const tx of transactions) {
      const d = parseISO(tx.date);
      if (isWithinInterval(d, { start, end })) {
        if (tx.type === 'income') income += tx.amount; else expenses += tx.amount;
      }
    }
    data.push({ name: format(monthDate, 'MMM'), income: income / 100, expenses: expenses / 100 });
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 30, left: 4, bottom: 4 }}>
        <defs>
          <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--income)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--income)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--expense)" stopOpacity={0.12} />
            <stop offset="100%" stopColor="var(--expense)" stopOpacity={0} />
          </linearGradient>
        </defs>
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
          formatter={(value) => [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, '']}
          labelStyle={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="var(--income)"
          strokeWidth={2}
          fill="url(#gI)"
          name="Income"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, fill: 'var(--income)', stroke: 'var(--bg-card)' }}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stroke="var(--expense)"
          strokeWidth={2}
          fill="url(#gE)"
          name="Expenses"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, fill: 'var(--expense)', stroke: 'var(--bg-card)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
