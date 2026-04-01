'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/layout/Header';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ReportBarChart from '@/components/charts/ReportBarChart';
import { useFinance } from '@/hooks/FinanceContext';
import { formatCurrency } from '@/lib/utils';
import {
  format,
  parseISO,
  subMonths,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
} from 'date-fns';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';

type ViewMode = 'monthly' | 'weekly';

export default function ReportsPage() {
  const { transactions, categories } = useFinance();
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [offset, setOffset] = useState(0);

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  const { chartData, periodLabel, periodTransactions } = useMemo(() => {
    const now = new Date();

    if (viewMode === 'monthly') {
      const periodStart = subMonths(startOfMonth(now), 5 + offset * 6);
      const periodEnd = endOfMonth(subMonths(now, offset * 6));
      const months = eachMonthOfInterval({ start: periodStart, end: periodEnd });

      const data = months.map(month => {
        const mStart = startOfMonth(month);
        const mEnd = endOfMonth(month);
        let income = 0;
        let expenses = 0;

        for (const tx of transactions) {
          const d = parseISO(tx.date);
          if (isWithinInterval(d, { start: mStart, end: mEnd })) {
            if (tx.type === 'income') income += tx.amount;
            else expenses += tx.amount;
          }
        }

        return {
          name: format(month, 'MMM'),
          income: income / 100,
          expenses: expenses / 100,
        };
      });

      const label = `${format(periodStart, 'MMM yyyy')} — ${format(periodEnd, 'MMM yyyy')}`;

      const periodTxs = transactions.filter(tx => {
        const d = parseISO(tx.date);
        return isWithinInterval(d, { start: periodStart, end: periodEnd });
      });

      return { chartData: data, periodLabel: label, periodTransactions: periodTxs };
    } else {
      const periodEnd = endOfWeek(subWeeks(now, offset * 8), { weekStartsOn: 1 });
      const periodStart = startOfWeek(subWeeks(periodEnd, 7), { weekStartsOn: 1 });
      const weeks = eachWeekOfInterval({ start: periodStart, end: periodEnd }, { weekStartsOn: 1 });

      const data = weeks.map(week => {
        const wStart = startOfWeek(week, { weekStartsOn: 1 });
        const wEnd = endOfWeek(week, { weekStartsOn: 1 });
        let income = 0;
        let expenses = 0;

        for (const tx of transactions) {
          const d = parseISO(tx.date);
          if (isWithinInterval(d, { start: wStart, end: wEnd })) {
            if (tx.type === 'income') income += tx.amount;
            else expenses += tx.amount;
          }
        }

        return {
          name: format(wStart, 'MMM d'),
          income: income / 100,
          expenses: expenses / 100,
        };
      });

      const label = `${format(periodStart, 'MMM d, yyyy')} — ${format(periodEnd, 'MMM d, yyyy')}`;

      const periodTxs = transactions.filter(tx => {
        const d = parseISO(tx.date);
        return isWithinInterval(d, { start: periodStart, end: periodEnd });
      });

      return { chartData: data, periodLabel: label, periodTransactions: periodTxs };
    }
  }, [transactions, viewMode, offset]);

  // Category breakdown for the period
  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    let totalExpenses = 0;

    for (const tx of periodTransactions) {
      if (tx.type === 'expense') {
        totals.set(tx.categoryId, (totals.get(tx.categoryId) || 0) + tx.amount);
        totalExpenses += tx.amount;
      }
    }

    return Array.from(totals.entries())
      .map(([catId, amount]) => {
        const cat = categoryMap.get(catId);
        return {
          name: cat?.name || 'Unknown',
          color: cat?.color || '#6b7280',
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [periodTransactions, categoryMap]);

  const totalIncome = periodTransactions
    .filter(tx => tx.type === 'income')
    .reduce((s, tx) => s + tx.amount, 0);

  const totalExpenses = periodTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((s, tx) => s + tx.amount, 0);

  return (
    <>
      <Header
        title="Reports"
        actions={
          <div
            style={{
              display: 'flex',
              gap: 4,
              padding: 3,
              borderRadius: 10,
              background: 'var(--bg-hover)',
            }}
          >
            <button
              onClick={() => { setViewMode('monthly'); setOffset(0); }}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 150ms, color 150ms',
                background: viewMode === 'monthly' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'monthly' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'monthly' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => { setViewMode('weekly'); setOffset(0); }}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 150ms, color 150ms',
                background: viewMode === 'weekly' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'weekly' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'weekly' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              Weekly
            </button>
          </div>
        }
      />
      <PageWrapper>
        {/* Period Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOffset(o => o + 1)}
            icon={<ChevronLeft style={{ width: 16, height: 16 }} />}
          >
            Previous
          </Button>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{periodLabel}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOffset(o => Math.max(0, o - 1))}
            disabled={offset === 0}
          >
            Next
            <ChevronRight style={{ width: 16, height: 16 }} />
          </Button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
          <Card>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Period Income</p>
            <p style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-space-grotesk), sans-serif', color: 'var(--income)' }}>
              {formatCurrency(totalIncome)}
            </p>
          </Card>
          <Card>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Period Expenses</p>
            <p style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-space-grotesk), sans-serif', color: 'var(--expense)' }}>
              {formatCurrency(totalExpenses)}
            </p>
          </Card>
          <Card>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Net</p>
            <p
              style={{
                fontSize: 20, fontWeight: 700,
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                color: totalIncome >= totalExpenses ? 'var(--income)' : 'var(--expense)',
              }}
            >
              {formatCurrency(totalIncome - totalExpenses)}
            </p>
          </Card>
        </div>

        {/* Bar Chart */}
        <div style={{ marginBottom: 24 }}><Card>
          <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', color: 'var(--text-primary)' }}>
            Income vs Expenses
          </h3>
          {chartData.every(d => d.income === 0 && d.expenses === 0) ? (
            <div className="flex items-center justify-center h-[320px] text-sm" style={{ color: 'var(--text-muted)' }}>
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                No data for this period
              </div>
            </div>
          ) : (
            <ReportBarChart data={chartData} />
          )}
        </Card></div>

        {/* Category Breakdown Table */}
        <Card>
          <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', color: 'var(--text-primary)' }}>
            Expense Breakdown by Category
          </h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No expenses in this period</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 14, borderCollapse: 'separate', borderSpacing: '0 4px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Category</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Amount</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--text-muted)', width: 96, borderBottom: '1px solid var(--border-color)' }}>% of Total</th>
                    <th style={{ width: 160, borderBottom: '1px solid var(--border-color)' }} />
                  </tr>
                </thead>
                <tbody>
                  {categoryBreakdown.map(row => (
                    <tr key={row.name}>
                      <td style={{ padding: '14px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0, backgroundColor: row.color }} />
                          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 0', textAlign: 'right', fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>
                        {formatCurrency(row.amount)}
                      </td>
                      <td style={{ padding: '14px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>
                        {row.percentage.toFixed(1)}%
                      </td>
                      <td style={{ padding: '14px 0' }}>
                        <div style={{ width: '100%', borderRadius: 99, height: 6, background: 'var(--bg-hover)' }}>
                          <div
                            style={{
                              height: 6, borderRadius: 99,
                              width: `${row.percentage}%`,
                              backgroundColor: row.color,
                              transition: 'width 500ms',
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </PageWrapper>
    </>
  );
}
