'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction, Category } from '@/types/finance';

interface Props { transactions: Transaction[]; categories: Category[]; }

export default function CategoryPieChart({ transactions, categories }: Props) {
  const expensesByCategory = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type === 'expense') {
      expensesByCategory.set(tx.categoryId, (expensesByCategory.get(tx.categoryId) || 0) + tx.amount);
    }
  }

  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const data = Array.from(expensesByCategory.entries())
    .map(([catId, amount]) => {
      const cat = categoryMap.get(catId);
      return { name: cat?.name || 'Unknown', value: amount / 100, color: cat?.color || '#6b7280' };
    })
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-[13px]" style={{ color: 'var(--text-muted)' }}>
        No expense data
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={190}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={3} dataKey="value" stroke="none">
            {data.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-color)',
              borderRadius: '12px', fontSize: '12px', boxShadow: 'var(--shadow-elevated)', padding: '10px 14px',
            }}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, '']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2.5 mt-2">
        {data.slice(0, 5).map(item => (
          <div key={item.name} className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
            <span className="text-[12px] flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
            <span className="text-[12px] font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              ${item.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[11px] tabular-nums shrink-0" style={{ color: 'var(--text-muted)' }}>
              {((item.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
