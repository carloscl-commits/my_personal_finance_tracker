'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Transaction, Category } from '@/types/finance';

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

export default function CategoryPieChart({ transactions, categories }: Props) {
  const expensesByCategory = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.type === 'expense') {
      expensesByCategory.set(
        tx.categoryId,
        (expensesByCategory.get(tx.categoryId) || 0) + tx.amount
      );
    }
  }

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const data = Array.from(expensesByCategory.entries())
    .map(([catId, amount]) => {
      const cat = categoryMap.get(catId);
      return {
        name: cat?.name || 'Unknown',
        value: amount / 100,
        color: cat?.color || '#6b7280',
      };
    })
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-text-tertiary text-sm">
        No expense data to display
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="60%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, '']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-2">
        {data.slice(0, 6).map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-text-secondary truncate flex-1">{item.name}</span>
            <span className="text-text-primary font-medium">${item.value.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
