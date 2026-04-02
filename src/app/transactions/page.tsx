'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/layout/Header';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Textarea from '@/components/ui/Textarea';
import EmptyState from '@/components/ui/EmptyState';
import { useFinance } from '@/hooks/FinanceContext';
import { formatCurrency, parseCurrencyToCents } from '@/lib/utils';
import { Transaction, TransactionType } from '@/types/finance';
import { format, parseISO } from 'date-fns';
import {
  Plus,
  Search,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Trash2,
  ArrowLeftRight,
  Download,
  Upload,
} from 'lucide-react';
import { exportTransactionsToCsv, downloadCsv, parseCsvString, CsvRow } from '@/lib/csv';

type SortField = 'date' | 'amount';
type SortDir = 'asc' | 'desc';

interface TransactionFormData {
  date: string;
  description: string;
  amount: string;
  type: TransactionType;
  categoryId: string;
  notes: string;
  isRecurring: boolean;
}

function createEmptyForm(): TransactionFormData {
  return {
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    amount: '',
    type: 'expense',
    categoryId: 'cat-food',
    notes: '',
    isRecurring: false,
  };
}

export default function TransactionsPage() {
  const {
    transactions,
    categories,
    addTransaction,
    addTransactions,
    updateTransaction,
    deleteTransaction,
    currency,
  } = useFinance();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>(createEmptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // CSV state
  const [csvTab, setCsvTab] = useState(false);
  const [csvPreview, setCsvPreview] = useState<CsvRow[] | null>(null);
  const [csvErrors, setCsvErrors] = useState<{ row: number; field: string; message: string }[]>([]);
  const [csvImporting, setCsvImporting] = useState(false);

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(tx => tx.description.toLowerCase().includes(s));
    }
    if (filterType !== 'all') {
      result = result.filter(tx => tx.type === filterType);
    }
    if (filterCategory !== 'all') {
      result = result.filter(tx => tx.categoryId === filterCategory);
    }
    if (filterDateFrom) {
      result = result.filter(tx => tx.date >= filterDateFrom);
    }
    if (filterDateTo) {
      result = result.filter(tx => tx.date <= filterDateTo);
    }

    result.sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'date') return mul * a.date.localeCompare(b.date);
      return mul * (a.amount - b.amount);
    });

    return result;
  }, [transactions, search, filterType, filterCategory, filterDateFrom, filterDateTo, sortField, sortDir]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(createEmptyForm());
    setModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setFormData({
      date: tx.date,
      description: tx.description,
      amount: (tx.amount / 100).toFixed(2),
      type: tx.type,
      categoryId: tx.categoryId,
      notes: tx.notes,
      isRecurring: tx.isRecurring,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseCurrencyToCents(formData.amount);
    if (!formData.description || amount <= 0) return;

    const txData = {
      date: formData.date,
      description: formData.description,
      amount,
      type: formData.type,
      categoryId: formData.categoryId,
      notes: formData.notes,
      isRecurring: formData.isRecurring,
    };

    if (editingId) {
      updateTransaction(editingId, txData);
    } else {
      addTransaction(txData);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setDeleteConfirmId(null);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  // CSV handlers
  const handleExport = () => {
    const csv = exportTransactionsToCsv(transactions, categories);
    downloadCsv(csv, `cashflow-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseCsvString(text, categories);
      setCsvPreview(result.rows);
      setCsvErrors(result.errors);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!csvPreview || csvPreview.length === 0) return;
    setCsvImporting(true);

    const categoryNameMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

    const txs = csvPreview.map(row => ({
      date: row.date,
      description: row.description,
      amount: parseCurrencyToCents(row.amount),
      type: row.type as TransactionType,
      categoryId: categoryNameMap.get(row.category.toLowerCase()) || 'cat-other',
      notes: row.notes || '',
      isRecurring: false,
    }));

    addTransactions(txs);

    setCsvPreview(null);
    setCsvErrors([]);
    setCsvImporting(false);
    setCsvTab(false);
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(c => ({ value: c.id, label: c.name })),
  ];

  const categoryFormOptions = categories.map(c => ({ value: c.id, label: c.name }));

  // CSV Tab View
  if (csvTab) {
    return (
      <>
        <Header
          title="CSV Import / Export"

          actions={
            <Button variant="ghost" size="sm" onClick={() => setCsvTab(false)}>
              Back to Transactions
            </Button>
          }
        />
        <PageWrapper>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--accent-muted)' }}
                >
                  <Download className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', color: 'var(--text-primary)' }}>
                    Export Transactions
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Download all transactions as CSV</p>
                </div>
              </div>
              <Button onClick={handleExport} icon={<Download style={{ width: 16, height: 16 }} />}>
                Export CSV
              </Button>
            </Card>

            {/* Import */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--accent-muted)' }}
                >
                  <Upload className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', color: 'var(--text-primary)' }}>
                    Import Transactions
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Upload a CSV with columns: Date, Description, Amount, Type, Category, Notes</p>
                </div>
              </div>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  height: 36,
                  padding: '0 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 10,
                  color: '#fff',
                  background: 'var(--accent)',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'opacity 150ms',
                }}
              >
                <Upload style={{ width: 14, height: 14 }} />
                Choose File
                <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
            </Card>
          </div>

          {/* Preview */}
          {csvPreview && (
            <Card className="mt-6">
              <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', color: 'var(--text-primary)' }}>
                Import Preview ({csvPreview.length} rows)
              </h3>

              {csvErrors.length > 0 && (
                <div
                  className="mb-4 p-3 rounded-lg border"
                  style={{ backgroundColor: 'var(--expense-bg)', borderColor: 'var(--expense)' }}
                >
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--expense)' }}>Validation Errors:</p>
                  {csvErrors.map((err, i) => (
                    <p key={i} className="text-xs" style={{ color: 'var(--expense)' }}>
                      Row {err.row}: {err.message}
                    </p>
                  ))}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottomWidth: '1px', borderColor: 'var(--border-color)' }}>
                      <th className="text-left py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Date</th>
                      <th className="text-left py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Description</th>
                      <th className="text-right py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Amount</th>
                      <th className="text-left py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Type</th>
                      <th className="text-left py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.slice(0, 20).map((row, i) => {
                      const hasError = csvErrors.some(e => e.row === i + 1);
                      return (
                        <tr
                          key={i}
                          style={{
                            borderBottomWidth: '1px',
                            borderColor: 'var(--border-color)',
                            ...(hasError ? { background: 'var(--expense-bg)' } : {}),
                          }}
                        >
                          <td className="py-2" style={{ color: 'var(--text-primary)' }}>{row.date}</td>
                          <td className="py-2" style={{ color: 'var(--text-primary)' }}>{row.description}</td>
                          <td className="py-2 text-right" style={{ color: 'var(--text-primary)' }}>${row.amount}</td>
                          <td className="py-2">
                            <Badge color={row.type === 'income' ? '#059669' : '#dc2626'}>{row.type}</Badge>
                          </td>
                          <td className="py-2" style={{ color: 'var(--text-secondary)' }}>{row.category || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handleConfirmImport}
                  disabled={csvPreview.length === 0 || csvImporting}
                >
                  {csvImporting ? 'Importing...' : `Import ${csvPreview.length} Transactions`}
                </Button>
                <Button variant="ghost" onClick={() => { setCsvPreview(null); setCsvErrors([]); }}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <Header
        title="Transactions"
        subtitle={`${transactions.length} total`}

        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => setCsvTab(true)} icon={<Download style={{ width: 14, height: 14 }} />}>
              CSV
            </Button>
            <Button size="sm" onClick={handleOpenAdd} icon={<Plus style={{ width: 14, height: 14 }} />}>
              Add
            </Button>
          </div>
        }
      />
      <PageWrapper>
        {/* Filters */}
        <Card>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: 12,
            }}
          >
            <div style={{ position: 'relative' }}>
              <Search
                style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 16, height: 16, color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', height: 36, paddingLeft: 36, paddingRight: 12,
                  fontSize: 13, borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-page)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as 'all' | TransactionType)}
              style={{
                width: '100%', height: 36, padding: '0 12px',
                fontSize: 13, borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-page)',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                paddingRight: 30,
              }}
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              style={{
                width: '100%', height: 36, padding: '0 12px',
                fontSize: 13, borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-page)',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                paddingRight: 30,
              }}
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => setFilterDateFrom(e.target.value)}
                onClick={e => (e.target as HTMLInputElement).showPicker?.()}
                placeholder="From"
                style={{
                  flex: 1, minWidth: 0, height: 36, padding: '0 10px',
                  fontSize: 13, borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-page)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
              <input
                type="date"
                value={filterDateTo}
                onChange={e => setFilterDateTo(e.target.value)}
                onClick={e => (e.target as HTMLInputElement).showPicker?.()}
                placeholder="To"
                style={{
                  flex: 1, minWidth: 0, height: 36, padding: '0 10px',
                  fontSize: 13, borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-page)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>
        </Card>

        <div style={{ height: 20 }} />

        {/* Transaction List */}
        <Card>
          {filteredTransactions.length === 0 ? (
            <EmptyState
              icon={<ArrowLeftRight className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />}
              title="No transactions found"
              description={search || filterType !== 'all' || filterCategory !== 'all'
                ? "Try adjusting your filters"
                : "Add your first transaction to get started"}
              action={
                !search && filterType === 'all' ? (
                  <Button size="sm" onClick={handleOpenAdd} icon={<Plus style={{ width: 14, height: 14 }} />}>
                    Add Transaction
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              {/* Sort Header */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '0 8px 16px', marginBottom: 8,
                  borderBottom: '1px solid var(--border-color)',
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const,
                  letterSpacing: '0.06em', color: 'var(--text-muted)',
                }}
              >
                <span style={{ width: 40 }} />
                <span style={{ flex: 1 }}>Description</span>
                <button
                  onClick={() => toggleSort('date')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 'inherit', fontWeight: 'inherit', textTransform: 'inherit' as const,
                    letterSpacing: 'inherit', color: 'inherit',
                  }}
                >
                  Date
                  {sortField === 'date' && <ArrowUpDown style={{ width: 12, height: 12 }} />}
                </button>
                <span style={{ width: 80, textAlign: 'center' }}>Category</span>
                <button
                  onClick={() => toggleSort('amount')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4,
                    width: 100, background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 'inherit', fontWeight: 'inherit', textTransform: 'inherit' as const,
                    letterSpacing: 'inherit', color: 'inherit',
                  }}
                >
                  Amount
                  {sortField === 'amount' && <ArrowUpDown style={{ width: 12, height: 12 }} />}
                </button>
                <span style={{ width: 64 }} />
              </div>

              {/* Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {filteredTransactions.map(tx => {
                  const cat = categoryMap.get(tx.categoryId);
                  return (
                    <div
                      key={tx.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '12px 8px', borderRadius: 12,
                        transition: 'background 150ms',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div
                        style={{
                          width: 40, height: 40, borderRadius: 12,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                          background: (cat?.color || '#6b7280') + '14',
                        }}
                      >
                        {tx.type === 'income' ? (
                          <ArrowUpRight style={{ width: 18, height: 18, color: 'var(--income)' }} />
                        ) : (
                          <ArrowDownRight style={{ width: 18, height: 18, color: cat?.color || '#6b7280' }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.description}
                        </p>
                        {tx.notes && (
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tx.notes}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: 12, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                        {format(parseISO(tx.date), 'MMM d, yyyy')}
                      </span>
                      <span style={{ width: 80, textAlign: 'center' }}>
                        <Badge color={cat?.color}>{cat?.name || 'Other'}</Badge>
                      </span>
                      <span
                        style={{
                          width: 100, textAlign: 'right',
                          fontSize: 14, fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                          color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)',
                        }}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                      </span>
                      <div style={{ width: 64, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          style={{ padding: 6, borderRadius: 6, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 150ms' }}
                          aria-label={`Edit ${tx.description}`}
                        >
                          <Pencil style={{ width: 14, height: 14 }} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(tx.id)}
                          style={{ padding: 6, borderRadius: 6, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 150ms' }}
                          aria-label={`Delete ${tx.description}`}
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </PageWrapper>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Transaction' : 'Add Transaction'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
              required
            />
            <Input
              label="Amount ($)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))}
              required
            />
          </div>
          <Input
            label="Description"
            placeholder="e.g. Grocery shopping"
            value={formData.description}
            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Select
              label="Type"
              value={formData.type}
              onChange={e => setFormData(f => ({ ...f, type: e.target.value as TransactionType }))}
              options={[
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' },
              ]}
            />
            <Select
              label="Category"
              value={formData.categoryId}
              onChange={e => setFormData(f => ({ ...f, categoryId: e.target.value }))}
              options={categoryFormOptions}
            />
          </div>
          <Textarea
            label="Notes (optional)"
            placeholder="Additional details..."
            value={formData.notes}
            onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={e => setFormData(f => ({ ...f, isRecurring: e.target.checked }))}
              style={{ width: 16, height: 16, borderRadius: 4, accentColor: 'var(--accent)' }}
            />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Mark as recurring</span>
          </label>
          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <Button type="submit">
              {editingId ? 'Update' : 'Add'} Transaction
            </Button>
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Transaction"
        size="sm"
      >
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="danger" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
            Delete
          </Button>
          <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}
