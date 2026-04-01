'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Transaction } from '@/types/finance';
import { format, subMonths, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface Props {
  transactions: Transaction[];
  months?: number;
}

export default function IncomeExpenseChart({ transactions, months = 6 }: Props) {
  const now = new Date();
  const data = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const label = format(monthDate, 'MMM yyyy');

    let income = 0;
    let expenses = 0;

    for (const tx of transactions) {
      const txDate = parseISO(tx.date);
      if (isWithinInterval(txDate, { start, end })) {
        if (tx.type === 'income') income += tx.amount;
        else expenses += tx.amount;
      }
    }

    data.push({
      name: label,
      income: income / 100,
      expenses: expenses / 100,
    });
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
          </linearGradient>
        </defs>
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
        <Area
          type="monotone"
          dataKey="income"
          stroke="#059669"
          strokeWidth={2}
          fill="url(#gradIncome)"
          name="Income"
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stroke="#dc2626"
          strokeWidth={2}
          fill="url(#gradExpense)"
          name="Expenses"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
