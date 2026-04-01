'use client';

import React, { useState } from 'react';
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
import { TransactionType, RecurrenceInterval, RecurringRule } from '@/types/finance';
import { format, parseISO } from 'date-fns';
import { Plus, Repeat, Pencil, Trash2, Pause, Play } from 'lucide-react';

interface FormData {
  description: string;
  amount: string;
  type: TransactionType;
  categoryId: string;
  notes: string;
  interval: RecurrenceInterval;
  startDate: string;
  isActive: boolean;
}

const emptyForm: FormData = {
  description: '',
  amount: '',
  type: 'expense',
  categoryId: 'cat-food',
  notes: '',
  interval: 'monthly',
  startDate: format(new Date(), 'yyyy-MM-dd'),
  isActive: true,
};

export default function RecurringPage({ onMenuClick }: { onMenuClick?: () => void }) {
  const {
    recurringRules,
    categories,
    addRecurringRule,
    updateRecurringRule,
    deleteRecurringRule,
  } = useFinance();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (rule: RecurringRule) => {
    setEditingId(rule.id);
    setFormData({
      description: rule.description,
      amount: (rule.amount / 100).toFixed(2),
      type: rule.type,
      categoryId: rule.categoryId,
      notes: rule.notes,
      interval: rule.interval,
      startDate: rule.startDate,
      isActive: rule.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseCurrencyToCents(formData.amount);
    if (!formData.description || amount <= 0) return;

    const ruleData = {
      description: formData.description,
      amount,
      type: formData.type,
      categoryId: formData.categoryId,
      notes: formData.notes,
      interval: formData.interval,
      startDate: formData.startDate,
      isActive: formData.isActive,
    };

    if (editingId) {
      updateRecurringRule(editingId, ruleData);
    } else {
      addRecurringRule(ruleData);
    }
    setModalOpen(false);
  };

  const handleToggleActive = (rule: RecurringRule) => {
    updateRecurringRule(rule.id, { isActive: !rule.isActive });
  };

  const handleDelete = (id: string) => {
    deleteRecurringRule(id);
    setDeleteConfirmId(null);
  };

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

  return (
    <>
      <Header
        title="Recurring Transactions"
        subtitle={`${recurringRules.length} rules`}
        onMenuClick={onMenuClick || (() => {})}
        actions={
          <Button size="sm" onClick={handleOpenAdd} icon={<Plus className="w-3.5 h-3.5" />}>
            <span className="hidden sm:inline">Add Rule</span>
          </Button>
        }
      />
      <PageWrapper>
        {recurringRules.length === 0 ? (
          <EmptyState
            icon={<Repeat className="w-7 h-7 text-text-tertiary" />}
            title="No recurring rules"
            description="Set up automatic recurring transactions like subscriptions, salary, or rent"
            action={
              <Button size="sm" onClick={handleOpenAdd} icon={<Plus className="w-3.5 h-3.5" />}>
                Add Recurring Rule
              </Button>
            }
          />
        ) : (
          <div className="space-y-3 stagger-children">
            {recurringRules.map(rule => {
              const cat = categoryMap.get(rule.categoryId);
              return (
                <Card key={rule.id}>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: (cat?.color || '#6b7280') + '18' }}
                    >
                      <Repeat className="w-4 h-4" style={{ color: cat?.color || '#6b7280' }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {rule.description}
                        </p>
                        {!rule.isActive && (
                          <Badge variant="outline">Paused</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-tertiary">
                        <span className="capitalize">{rule.interval}</span>
                        <span>·</span>
                        <span>Since {format(parseISO(rule.startDate), 'MMM d, yyyy')}</span>
                        {rule.lastGeneratedDate && (
                          <>
                            <span>·</span>
                            <span>Last: {format(parseISO(rule.lastGeneratedDate), 'MMM d')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <Badge color={cat?.color}>{cat?.name || 'Other'}</Badge>

                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{
                        color: rule.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)',
                      }}
                    >
                      {rule.type === 'income' ? '+' : '-'}{formatCurrency(rule.amount)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className="p-1.5 rounded-md hover:bg-bg-tertiary transition-colors text-text-tertiary hover:text-text-primary"
                        title={rule.isActive ? 'Pause' : 'Resume'}
                      >
                        {rule.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(rule)}
                        className="p-1.5 rounded-md hover:bg-bg-tertiary transition-colors text-text-tertiary hover:text-text-primary"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(rule.id)}
                        className="p-1.5 rounded-md hover:bg-expense-bg transition-colors text-text-tertiary hover:text-expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </PageWrapper>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Recurring Rule' : 'New Recurring Rule'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Description"
            placeholder="e.g. Monthly Rent"
            value={formData.description}
            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-4">
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
            <Select
              label="Type"
              value={formData.type}
              onChange={e => setFormData(f => ({ ...f, type: e.target.value as TransactionType }))}
              options={[
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Frequency"
              value={formData.interval}
              onChange={e => setFormData(f => ({ ...f, interval: e.target.value as RecurrenceInterval }))}
              options={[
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />
            <Select
              label="Category"
              value={formData.categoryId}
              onChange={e => setFormData(f => ({ ...f, categoryId: e.target.value }))}
              options={categoryOptions}
            />
          </div>
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={e => setFormData(f => ({ ...f, startDate: e.target.value }))}
            required
          />
          <Textarea
            label="Notes (optional)"
            placeholder="Additional details..."
            value={formData.notes}
            onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={e => setFormData(f => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30"
            />
            <span className="text-sm text-text-secondary">Active</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="submit">
              {editingId ? 'Update' : 'Create'} Rule
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
        title="Delete Recurring Rule"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-2">
          Are you sure you want to delete this recurring rule?
        </p>
        <p className="text-xs text-text-tertiary mb-4">
          Previously generated transactions will not be affected.
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
