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
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { transactions, categories } = useFinance();

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
      label: 'Total Income', value: totalIncome,
      color: '#10b981', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)',
      glowBorder: 'rgba(16,185,129,0.15)', icon: TrendingUp,
    },
    {
      label: 'Total Expenses', value: totalExpenses,
      color: '#f43f5e', gradient: 'linear-gradient(135deg, rgba(244,63,94,0.08) 0%, rgba(244,63,94,0.02) 100%)',
      glowBorder: 'rgba(244,63,94,0.15)', icon: TrendingDown,
    },
    {
      label: 'Net Balance', value: netBalance,
      color: netBalance >= 0 ? '#10b981' : '#f43f5e',
      gradient: netBalance >= 0
        ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)'
        : 'linear-gradient(135deg, rgba(244,63,94,0.08) 0%, rgba(244,63,94,0.02) 100%)',
      glowBorder: netBalance >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
      icon: Wallet,
    },
  ];

  return (
    <>
      <Header title="Dashboard" subtitle={format(now, 'MMMM yyyy')} />
      <PageWrapper>
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 stagger-children">
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{
                  background: card.gradient,
                  border: `1px solid ${card.glowBorder}`,
                  boxShadow: `0 0 0 1px ${card.glowBorder}`,
                }}
              >
                {/* Decorative glow circle */}
                <div
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-30 blur-2xl"
                  style={{ background: card.color }}
                />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                      {card.label}
                    </p>
                    <p className="text-[28px] font-extrabold leading-none tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', color: card.color }}>
                      {formatCurrency(card.value)}
                    </p>
                    <p className="text-[11px] mt-2.5" style={{ color: 'var(--text-muted)' }}>This month</p>
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: card.color + '18' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-bold" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', color: 'var(--text-primary)' }}>
                Income vs Expenses
              </h3>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                Last 6 months
              </span>
            </div>
            <IncomeExpenseChart transactions={transactions} />
          </Card>
          <Card>
            <h3 className="text-[14px] font-bold mb-6" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', color: 'var(--text-primary)' }}>
              Spending by Category
            </h3>
            <CategoryPieChart transactions={currentMonthTxs} categories={categories} />
          </Card>
        </div>

        {/* ── Recent Transactions ── */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[14px] font-bold" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', color: 'var(--text-primary)' }}>
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
            <p className="text-[13px] text-center py-12" style={{ color: 'var(--text-muted)' }}>
              No transactions yet. Add your first one!
            </p>
          ) : (
            <table className="w-full">
              <tbody>
                {recentTransactions.map(tx => {
                  const cat = categoryMap.get(tx.categoryId);
                  return (
                    <tr key={tx.id} className="group">
                      <td className="py-3 pr-3 w-10">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: (cat?.color || '#6b7280') + '12' }}
                        >
                          {tx.type === 'income'
                            ? <ArrowUpRight className="w-[18px] h-[18px]" style={{ color: 'var(--income)' }} />
                            : <ArrowDownRight className="w-[18px] h-[18px]" style={{ color: cat?.color || '#6b7280' }} />
                          }
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{tx.description}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{format(parseISO(tx.date), 'MMM d, yyyy')}</p>
                      </td>
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <Badge color={cat?.color}>{cat?.name || 'Other'}</Badge>
                      </td>
                      <td className="py-3 pl-3 text-right whitespace-nowrap">
                        <span
                          className="text-[14px] font-bold tabular-nums"
                          style={{ color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)' }}
                        >
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </PageWrapper>
    </>
  );
}
