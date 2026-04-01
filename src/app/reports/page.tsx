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
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg p-0.5" style={{ background: 'var(--bg-hover)' }}>
              <button
                onClick={() => { setViewMode('monthly'); setOffset(0); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === 'monthly'
                    ? 'shadow-sm'
                    : 'hover:opacity-80'
                }`}
                style={
                  viewMode === 'monthly'
                    ? { background: 'var(--bg-card)', color: 'var(--text-primary)' }
                    : { color: 'var(--text-muted)' }
                }
              >
                Monthly
              </button>
              <button
                onClick={() => { setViewMode('weekly'); setOffset(0); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === 'weekly'
                    ? 'shadow-sm'
                    : 'hover:opacity-80'
                }`}
                style={
                  viewMode === 'weekly'
                    ? { background: 'var(--bg-card)', color: 'var(--text-primary)' }
                    : { color: 'var(--text-muted)' }
                }
              >
                Weekly
              </button>
            </div>
          </div>
        }
      />
      <PageWrapper>
        {/* Period Navigator */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOffset(o => o + 1)}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{periodLabel}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOffset(o => Math.max(0, o - 1))}
            disabled={offset === 0}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Period Income</p>
            <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', color: 'var(--income)' }}>
              {formatCurrency(totalIncome)}
            </p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Period Expenses</p>
            <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', color: 'var(--expense)' }}>
              {formatCurrency(totalExpenses)}
            </p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Net</p>
            <p
              className="text-xl font-bold"
              style={{
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                color: totalIncome >= totalExpenses ? 'var(--income)' : 'var(--expense)',
              }}
            >
              {formatCurrency(totalIncome - totalExpenses)}
            </p>
          </Card>
        </div>

        {/* Bar Chart */}
        <Card className="mb-6">
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
        </Card>

        {/* Category Breakdown Table */}
        <Card>
          <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', color: 'var(--text-primary)' }}>
            Expense Breakdown by Category
          </h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No expenses in this period</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottomWidth: '1px', borderColor: 'var(--border-color)' }}>
                    <th className="text-left py-2.5 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Category</th>
                    <th className="text-right py-2.5 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Amount</th>
                    <th className="text-right py-2.5 text-xs font-medium uppercase tracking-wider w-24" style={{ color: 'var(--text-muted)' }}>% of Total</th>
                    <th className="text-left py-2.5 text-xs font-medium uppercase tracking-wider w-40 hidden sm:table-cell" style={{ color: 'var(--text-muted)' }} />
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {categoryBreakdown.map(row => (
                    <tr key={row.name} style={{ borderColor: 'var(--border-color)' }}>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{row.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="py-3 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                        {row.percentage.toFixed(1)}%
                      </td>
                      <td className="py-3 hidden sm:table-cell">
                        <div className="w-full rounded-full h-2" style={{ background: 'var(--bg-hover)' }}>
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${row.percentage}%`,
                              backgroundColor: row.color,
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
