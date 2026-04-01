'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart';
import CategoryPieChart from '@/components/charts/CategoryPieChart';
import { useFinance } from '@/hooks/FinanceContext';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage({ onMenuClick }: { onMenuClick?: () => void }) {
  const { transactions, categories } = useFinance();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const currentMonthTxs = transactions.filter(tx => {
    const d = parseISO(tx.date);
    return isWithinInterval(d, { start: monthStart, end: monthEnd });
  });

  const totalIncome = currentMonthTxs
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = currentMonthTxs
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  return (
    <>
      <Header
        title="Dashboard"
        subtitle={format(now, 'MMMM yyyy')}
        onMenuClick={onMenuClick || (() => {})}
      />
      <PageWrapper>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 stagger-children">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Income</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-income-bg)' }}>
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-income)' }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {formatCurrency(totalIncome)}
            </p>
            <p className="text-xs text-text-tertiary mt-1">This month</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Expenses</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-expense-bg)' }}>
                <TrendingDown className="w-4 h-4" style={{ color: 'var(--color-expense)' }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-xs text-text-tertiary mt-1">This month</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Net Balance</span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: netBalance >= 0 ? 'var(--color-income-bg)' : 'var(--color-expense-bg)',
                }}
              >
                <Wallet
                  className="w-4 h-4"
                  style={{
                    color: netBalance >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
                  }}
                />
              </div>
            </div>
            <p
              className="text-2xl font-bold"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                color: netBalance >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
              }}
            >
              {formatCurrency(netBalance)}
            </p>
            <p className="text-xs text-text-tertiary mt-1">This month</p>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
          <Card className="lg:col-span-3">
            <h3
              className="text-sm font-bold text-text-primary mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Income vs Expenses
            </h3>
            <IncomeExpenseChart transactions={transactions} />
          </Card>

          <Card className="lg:col-span-2">
            <h3
              className="text-sm font-bold text-text-primary mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Spending by Category
            </h3>
            <CategoryPieChart transactions={currentMonthTxs} categories={categories} />
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-sm font-bold text-text-primary"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Recent Transactions
            </h3>
            <Link
              href="/transactions"
              className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
            >
              View all
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-8">
              No transactions yet. Add your first one!
            </p>
          ) : (
            <div className="space-y-1">
              {recentTransactions.map(tx => {
                const cat = categoryMap.get(tx.categoryId);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-bg-secondary transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: (cat?.color || '#6b7280') + '18' }}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4" style={{ color: 'var(--color-income)' }} />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" style={{ color: cat?.color || '#6b7280' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {format(parseISO(tx.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge color={cat?.color}>{cat?.name || 'Other'}</Badge>
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{
                        color: tx.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)',
                      }}
                    >
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </PageWrapper>
    </>
  );
}
