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
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
        <defs>
          <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
          tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} width={50}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-color)',
            borderRadius: '12px', fontSize: '12px', boxShadow: 'var(--shadow-elevated)', padding: '10px 14px',
          }}
          formatter={(value) => [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, '']}
          labelStyle={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}
        />
        <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#gI)" name="Income" dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: '#10b981', stroke: '#fff' }} />
        <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gE)" name="Expenses" dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: '#f43f5e', stroke: '#fff' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
