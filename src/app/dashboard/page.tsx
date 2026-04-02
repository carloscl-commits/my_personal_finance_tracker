'use client';

import Header from '@/components/layout/Header';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart';
import CategoryPieChart from '@/components/charts/CategoryPieChart';
import { useFinance } from '@/hooks/FinanceContext';
import { formatCurrency, getCurrencySymbol } from '@/lib/utils';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { transactions, categories, currency } = useFinance();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const currentMonthTxs = transactions.filter(tx => {
    const d = parseISO(tx.date);
    return isWithinInterval(d, { start: monthStart, end: monthEnd });
  });

  const totalIncome = currentMonthTxs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
  const totalExpenses = currentMonthTxs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const recentTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const cards = [
    {
      label: 'Total Income',
      value: totalIncome,
      color: 'var(--income)',
      bgTint: 'var(--income-bg)',
      icon: TrendingUp,
    },
    {
      label: 'Total Expenses',
      value: totalExpenses,
      color: 'var(--expense)',
      bgTint: 'var(--expense-bg)',
      icon: TrendingDown,
    },
    {
      label: 'Net Balance',
      value: netBalance,
      color: netBalance >= 0 ? 'var(--income)' : 'var(--expense)',
      bgTint: netBalance >= 0 ? 'var(--income-bg)' : 'var(--expense-bg)',
      icon: Wallet,
    },
  ];

  return (
    <>
      <Header title="Dashboard" subtitle={format(now, 'MMMM yyyy')} />
      <PageWrapper>
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 stagger-children" style={{ gap: 20, marginBottom: 28 }}>
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-2xl relative"
                style={{
                  padding: '24px 28px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p
                      className="text-[11px] font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {card.label}
                    </p>
                    <p
                      className="text-[26px] font-extrabold leading-tight tracking-tight mt-2"
                      style={{
                        fontFamily: 'var(--font-space-grotesk), sans-serif',
                        color: card.color,
                      }}
                    >
                      {formatCurrency(card.value, currency)}
                    </p>
                    <p
                      className="text-[11px] mt-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      This month
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: card.bgTint }}
                  >
                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 20, marginBottom: 28 }}>
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h3
                className="text-sm font-bold"
                style={{
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  color: 'var(--text-primary)',
                }}
              >
                Income vs Expenses
              </h3>
              <span
                className="text-[11px] font-medium px-2.5 py-1 rounded-md"
                style={{ background: 'var(--bg-inset)', color: 'var(--text-muted)' }}
              >
                Last 6 months
              </span>
            </div>
            <IncomeExpenseChart transactions={transactions} currencySymbol={getCurrencySymbol(currency)} />
          </Card>
          <Card>
            <h3
              className="text-sm font-bold mb-5"
              style={{
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                color: 'var(--text-primary)',
              }}
            >
              Spending by Category
            </h3>
            <CategoryPieChart transactions={currentMonthTxs} categories={categories} currencySymbol={getCurrencySymbol(currency)} />
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3
              className="text-sm font-bold"
              style={{
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                color: 'var(--text-primary)',
              }}
            >
              Recent Transactions
            </h3>
            <Link
              href="/transactions"
              className="flex items-center gap-1 text-[12px] font-semibold transition-colors group"
              style={{ color: 'var(--accent)' }}
            >
              View all
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <p
              className="text-[13px] text-center py-12"
              style={{ color: 'var(--text-muted)' }}
            >
              No transactions yet. Add your first one!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recentTransactions.map(tx => {
                const cat = categoryMap.get(tx.categoryId);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 py-3 px-2 -mx-2 rounded-lg transition-colors"
                    style={{ cursor: 'default' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: (cat?.color || '#6b7280') + '14' }}
                    >
                      {tx.type === 'income'
                        ? <ArrowUpRight className="w-[18px] h-[18px]" style={{ color: 'var(--income)' }} />
                        : <ArrowDownRight className="w-[18px] h-[18px]" style={{ color: cat?.color || '#6b7280' }} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13px] font-semibold truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {tx.description}
                      </p>
                      <p
                        className="text-[11px] mt-0.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {format(parseISO(tx.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="hidden sm:block shrink-0">
                      <Badge color={cat?.color}>{cat?.name || 'Other'}</Badge>
                    </div>
                    <span
                      className="text-[14px] font-bold tabular-nums whitespace-nowrap shrink-0"
                      style={{ color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)', minWidth: 100, textAlign: 'right' }}
                    >
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
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
