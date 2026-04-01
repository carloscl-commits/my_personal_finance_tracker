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

const emptyForm: TransactionFormData = {
  date: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  amount: '',
  type: 'expense',
  categoryId: 'cat-food',
  notes: '',
  isRecurring: false,
};

export default function TransactionsPage({ onMenuClick }: { onMenuClick?: () => void }) {
  const {
    transactions,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
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
  const [formData, setFormData] = useState<TransactionFormData>(emptyForm);
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
    setFormData(emptyForm);
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
    if (!csvPreview) return;
    setCsvImporting(true);

    const categoryNameMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

    for (const row of csvPreview) {
      const catId = categoryNameMap.get(row.category.toLowerCase()) || 'cat-other';
      addTransaction({
        date: format(parseISO(row.date), 'yyyy-MM-dd'),
        description: row.description,
        amount: parseCurrencyToCents(row.amount),
        type: row.type as TransactionType,
        categoryId: catId,
        notes: row.notes || '',
        isRecurring: false,
      });
    }

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
          onMenuClick={onMenuClick || (() => {})}
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
                <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
                  <Download className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Export Transactions
                  </h3>
                  <p className="text-xs text-text-tertiary">Download all transactions as CSV</p>
                </div>
              </div>
              <Button onClick={handleExport} icon={<Download className="w-4 h-4" />}>
                Export CSV
              </Button>
            </Card>

            {/* Import */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
                  <Upload className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Import Transactions
                  </h3>
                  <p className="text-xs text-text-tertiary">Upload a CSV with columns: Date, Description, Amount, Type, Category, Notes</p>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors cursor-pointer btn-press">
                <Upload className="w-4 h-4" />
                Choose File
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
            </Card>
          </div>

          {/* Preview */}
          {csvPreview && (
            <Card className="mt-6">
              <h3 className="text-sm font-bold text-text-primary mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Import Preview ({csvPreview.length} rows)
              </h3>

              {csvErrors.length > 0 && (
                <div className="mb-4 p-3 rounded-lg border border-expense/30" style={{ backgroundColor: 'var(--color-expense-bg)' }}>
                  <p className="text-xs font-medium text-expense mb-2">Validation Errors:</p>
                  {csvErrors.map((err, i) => (
                    <p key={i} className="text-xs text-expense">
                      Row {err.row}: {err.message}
                    </p>
                  ))}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-text-tertiary font-medium">Date</th>
                      <th className="text-left py-2 text-text-tertiary font-medium">Description</th>
                      <th className="text-right py-2 text-text-tertiary font-medium">Amount</th>
                      <th className="text-left py-2 text-text-tertiary font-medium">Type</th>
                      <th className="text-left py-2 text-text-tertiary font-medium">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.slice(0, 20).map((row, i) => {
                      const hasError = csvErrors.some(e => e.row === i + 1);
                      return (
                        <tr key={i} className={`border-b border-border ${hasError ? 'bg-expense-bg' : ''}`}>
                          <td className="py-2 text-text-primary">{row.date}</td>
                          <td className="py-2 text-text-primary">{row.description}</td>
                          <td className="py-2 text-right text-text-primary">${row.amount}</td>
                          <td className="py-2">
                            <Badge color={row.type === 'income' ? '#059669' : '#dc2626'}>{row.type}</Badge>
                          </td>
                          <td className="py-2 text-text-secondary">{row.category || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handleConfirmImport}
                  disabled={csvErrors.some(e => e.row > 0) || csvImporting}
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
        onMenuClick={onMenuClick || (() => {})}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setCsvTab(true)} icon={<Download className="w-3.5 h-3.5" />}>
              <span className="hidden sm:inline">CSV</span>
            </Button>
            <Button size="sm" onClick={handleOpenAdd} icon={<Plus className="w-3.5 h-3.5" />}>
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
        }
      />
      <PageWrapper>
        {/* Filters */}
        <Card className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-bg-card text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
            </div>
            <Select
              value={filterType}
              onChange={e => setFilterType(e.target.value as 'all' | TransactionType)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
              ]}
            />
            <Select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              options={categoryOptions}
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => setFilterDateFrom(e.target.value)}
                className="flex-1 px-2 py-2 text-xs rounded-lg border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
              <input
                type="date"
                value={filterDateTo}
                onChange={e => setFilterDateTo(e.target.value)}
                className="flex-1 px-2 py-2 text-xs rounded-lg border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
            </div>
          </div>
        </Card>

        {/* Transaction List */}
        <Card padding={false}>
          {filteredTransactions.length === 0 ? (
            <EmptyState
              icon={<ArrowLeftRight className="w-7 h-7 text-text-tertiary" />}
              title="No transactions found"
              description={search || filterType !== 'all' || filterCategory !== 'all'
                ? "Try adjusting your filters"
                : "Add your first transaction to get started"}
              action={
                !search && filterType === 'all' ? (
                  <Button size="sm" onClick={handleOpenAdd} icon={<Plus className="w-3.5 h-3.5" />}>
                    Add Transaction
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              {/* Sort Header */}
              <div className="flex items-center gap-4 px-5 py-3 border-b border-border text-xs font-medium text-text-tertiary uppercase tracking-wider">
                <span className="w-9" />
                <span className="flex-1">Description</span>
                <button
                  onClick={() => toggleSort('date')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Date
                  {sortField === 'date' && <ArrowUpDown className="w-3 h-3" />}
                </button>
                <span className="w-20 text-center hidden sm:block">Category</span>
                <button
                  onClick={() => toggleSort('amount')}
                  className="flex items-center gap-1 w-24 justify-end hover:text-text-primary transition-colors"
                >
                  Amount
                  {sortField === 'amount' && <ArrowUpDown className="w-3 h-3" />}
                </button>
                <span className="w-16" />
              </div>

              {/* Rows */}
              <div className="divide-y divide-border">
                {filteredTransactions.map(tx => {
                  const cat = categoryMap.get(tx.categoryId);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-bg-secondary/50 transition-colors"
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
                        <p className="text-sm font-medium text-text-primary truncate">{tx.description}</p>
                        {tx.notes && (
                          <p className="text-xs text-text-tertiary truncate">{tx.notes}</p>
                        )}
                      </div>
                      <span className="text-xs text-text-tertiary whitespace-nowrap">
                        {format(parseISO(tx.date), 'MMM d, yyyy')}
                      </span>
                      <span className="w-20 text-center hidden sm:block">
                        <Badge color={cat?.color}>{cat?.name || 'Other'}</Badge>
                      </span>
                      <span
                        className="w-24 text-right text-sm font-semibold tabular-nums"
                        style={{
                          color: tx.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)',
                        }}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                      <div className="w-16 flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="p-1.5 rounded-md hover:bg-bg-tertiary transition-colors text-text-tertiary hover:text-text-primary"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(tx.id)}
                          className="p-1.5 rounded-md hover:bg-expense-bg transition-colors text-text-tertiary hover:text-expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={e => setFormData(f => ({ ...f, isRecurring: e.target.checked }))}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30"
            />
            <span className="text-sm text-text-secondary">Mark as recurring</span>
          </label>
          <div className="flex gap-3 pt-2">
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
        <p className="text-sm text-text-secondary mb-4">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>
        <div className="flex gap-3">
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
