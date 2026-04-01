'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { useFinance } from '@/hooks/FinanceContext';
import { Plus, Pencil, Trash2, Tags, Lock } from 'lucide-react';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#ec4899', '#f43f5e', '#6b7280', '#1e293b',
];

interface FormData {
  name: string;
  color: string;
}

export default function CategoriesPage() {
  const { categories, transactions, addCategory, updateCategory, deleteCategory } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', color: '#3b82f6' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const txCountByCategory = new Map<string, number>();
  for (const tx of transactions) {
    txCountByCategory.set(tx.categoryId, (txCountByCategory.get(tx.categoryId) || 0) + 1);
  }

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', color: '#3b82f6' });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: typeof categories[0]) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, color: cat.color });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      updateCategory(editingId, { name: formData.name.trim(), color: formData.color });
    } else {
      addCategory({ name: formData.name.trim(), color: formData.color });
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    setDeleteConfirmId(null);
  };

  return (
    <>
      <Header
        title="Categories"
        subtitle={`${categories.length} categories`}
        actions={
          <Button size="sm" onClick={handleOpenAdd} icon={<Plus className="w-3.5 h-3.5" />}>
            <span className="hidden sm:inline">Add Category</span>
          </Button>
        }
      />
      <PageWrapper>
        {categories.length === 0 ? (
          <EmptyState
            icon={<Tags className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />}
            title="No categories"
            description="Create your first category to organize transactions"
            action={
              <Button size="sm" onClick={handleOpenAdd} icon={<Plus className="w-3.5 h-3.5" />}>
                Add Category
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {categories.map(cat => {
              const count = txCountByCategory.get(cat.id) || 0;
              return (
                <Card key={cat.id} hover>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cat.color + '20' }}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{cat.name}</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {count} transaction{count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {cat.isDefault && (
                        <span className="mr-1" title="Default category">
                          <Lock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                        </span>
                      )}
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded-md transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label={`Edit ${cat.name}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {!cat.isDefault && (
                        <button
                          onClick={() => setDeleteConfirmId(cat.id)}
                          className="p-1.5 rounded-md transition-colors hover:opacity-80"
                          style={{ color: 'var(--text-muted)' }}
                          aria-label={`Delete ${cat.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
        title={editingId ? 'Edit Category' : 'New Category'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Subscriptions"
            value={formData.name}
            onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, color: c }))}
                  className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                  aria-label={`Select color ${c}`}
                  style={{
                    backgroundColor: c,
                    outline: formData.color === c ? '2px solid var(--text-primary)' : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">
              {editingId ? 'Update' : 'Create'} Category
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
        title="Delete Category"
        size="sm"
      >
        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete this category?
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Transactions in this category will be moved to &quot;Other&quot;.
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
