'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FinanceData,
  FinanceStore,
  Transaction,
  Category,
  RecurringRule,
} from '@/types/finance';
import { generateId } from '@/lib/utils';
import { addWeeks, addMonths, parseISO, isBefore, isEqual, startOfDay, format } from 'date-fns';

const STORAGE_KEY = 'finance_app_data';

// ── Default Categories ──
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food', color: '#f97316', isDefault: true },
  { id: 'cat-transport', name: 'Transport', color: '#3b82f6', isDefault: true },
  { id: 'cat-housing', name: 'Housing', color: '#8b5cf6', isDefault: true },
  { id: 'cat-health', name: 'Health', color: '#ef4444', isDefault: true },
  { id: 'cat-entertainment', name: 'Entertainment', color: '#ec4899', isDefault: true },
  { id: 'cat-shopping', name: 'Shopping', color: '#f59e0b', isDefault: true },
  { id: 'cat-salary', name: 'Salary', color: '#059669', isDefault: true },
  { id: 'cat-freelance', name: 'Freelance', color: '#14b8a6', isDefault: true },
  { id: 'cat-other', name: 'Other', color: '#6b7280', isDefault: true },
];

// ── Seed Data: 15 sample transactions spanning 2 months ──
function createSeedTransactions(): Transaction[] {
  const now = new Date();
  const thisMonth = format(now, 'yyyy-MM');
  const lastMonth = format(addMonths(now, -1), 'yyyy-MM');
  const lastMonthName = format(addMonths(now, -1), 'MMMM');
  const thisMonthName = format(now, 'MMMM');

  return [
    { id: generateId(), date: `${lastMonth}-01`, description: 'Monthly Salary', amount: 550000, type: 'income', categoryId: 'cat-salary', notes: `${lastMonthName} paycheck`, isRecurring: false },
    { id: generateId(), date: `${lastMonth}-03`, description: 'Grocery Store', amount: 8750, type: 'expense', categoryId: 'cat-food', notes: 'Weekly groceries', isRecurring: false },
    { id: generateId(), date: `${lastMonth}-05`, description: 'Electric Bill', amount: 12400, type: 'expense', categoryId: 'cat-housing', notes: '', isRecurring: false },
    { id: generateId(), date: `${lastMonth}-08`, description: 'Freelance Project', amount: 120000, type: 'income', categoryId: 'cat-freelance', notes: 'Web design project', isRecurring: false },
    { id: generateId(), date: `${lastMonth}-10`, description: 'Gas Station', amount: 4500, type: 'expense', categoryId: 'cat-transport', notes: '', isRecurring: false },
    { id: generateId(), date: `${lastMonth}-14`, description: 'Netflix Subscription', amount: 1599, type: 'expense', categoryId: 'cat-entertainment', notes: 'Monthly plan', isRecurring: false },
    { id: generateId(), date: `${lastMonth}-18`, description: 'Doctor Visit', amount: 15000, type: 'expense', categoryId: 'cat-health', notes: 'Annual checkup', isRecurring: false },
    { id: generateId(), date: `${lastMonth}-22`, description: 'New Headphones', amount: 7999, type: 'expense', categoryId: 'cat-shopping', notes: 'Sony WH-1000XM5', isRecurring: false },
    { id: generateId(), date: `${thisMonth}-01`, description: 'Monthly Salary', amount: 550000, type: 'income', categoryId: 'cat-salary', notes: `${thisMonthName} paycheck`, isRecurring: false },
    { id: generateId(), date: `${thisMonth}-02`, description: 'Rent Payment', amount: 150000, type: 'expense', categoryId: 'cat-housing', notes: `${thisMonthName} rent`, isRecurring: false },
    { id: generateId(), date: `${thisMonth}-04`, description: 'Grocery Store', amount: 9200, type: 'expense', categoryId: 'cat-food', notes: '', isRecurring: false },
    { id: generateId(), date: `${thisMonth}-06`, description: 'Uber Rides', amount: 3200, type: 'expense', categoryId: 'cat-transport', notes: 'Week total', isRecurring: false },
    { id: generateId(), date: `${thisMonth}-09`, description: 'Freelance Project', amount: 85000, type: 'income', categoryId: 'cat-freelance', notes: 'Logo design', isRecurring: false },
    { id: generateId(), date: `${thisMonth}-12`, description: 'Restaurant Dinner', amount: 6800, type: 'expense', categoryId: 'cat-food', notes: 'Birthday dinner', isRecurring: false },
    { id: generateId(), date: `${thisMonth}-15`, description: 'Online Course', amount: 4999, type: 'expense', categoryId: 'cat-other', notes: 'React advanced patterns', isRecurring: false },
  ];
}

function createSeedData(): FinanceData {
  return {
    version: 1,
    transactions: createSeedTransactions(),
    categories: DEFAULT_CATEGORIES,
    recurringRules: [],
    theme: 'light',
    accentColor: '#6366f1',
    currency: 'USD',
  };
}

function migrateData(raw: Record<string, unknown>): FinanceData {
  return {
    version: 1,
    transactions: Array.isArray(raw.transactions) ? raw.transactions : [],
    categories: Array.isArray(raw.categories) ? raw.categories : DEFAULT_CATEGORIES,
    recurringRules: Array.isArray(raw.recurringRules) ? raw.recurringRules : [],
    theme: raw.theme === 'dark' ? 'dark' : 'light',
    accentColor: typeof raw.accentColor === 'string' ? raw.accentColor : '#6366f1',
    currency: typeof raw.currency === 'string' ? raw.currency : 'USD',
  };
}

function loadData(): FinanceData {
  if (typeof window === 'undefined') return createSeedData();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (parsed.version === 1) return parsed as FinanceData;
    return migrateData(parsed);
  } catch {
    const seed = createSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function saveData(data: FinanceData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useFinanceStore(): FinanceStore {
  const [data, setData] = useState<FinanceData>(createSeedData);
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage on mount (client-only)
  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    setInitialized(true);
  }, []);

  // Persist to localStorage whenever data changes (after initialization)
  useEffect(() => {
    if (initialized) {
      saveData(data);
    }
  }, [data, initialized]);

  // Auto-generate recurring transactions on load
  useEffect(() => {
    if (initialized) {
      generateDueRecurringTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  // ── Transaction CRUD ──
  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>): Transaction => {
    const newTx: Transaction = { ...tx, id: generateId() };
    setData(prev => ({ ...prev, transactions: [...prev.transactions, newTx] }));
    return newTx;
  }, []);

  const addTransactions = useCallback((txs: Omit<Transaction, 'id'>[]): void => {
    const newTxs: Transaction[] = txs.map(tx => ({ ...tx, id: generateId() }));
    setData(prev => ({ ...prev, transactions: [...prev.transactions, ...newTxs] }));
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id'>>): void => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(tx =>
        tx.id === id ? { ...tx, ...updates } : tx
      ),
    }));
  }, []);

  const deleteTransaction = useCallback((id: string): void => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(tx => tx.id !== id),
    }));
  }, []);

  const getTransaction = useCallback((id: string): Transaction | undefined => {
    return data.transactions.find(tx => tx.id === id);
  }, [data.transactions]);

  // ── Category CRUD ──
  const addCategory = useCallback((cat: Omit<Category, 'id' | 'isDefault'>): Category => {
    const newCat: Category = { ...cat, id: generateId(), isDefault: false };
    setData(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
    return newCat;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Omit<Category, 'id' | 'isDefault'>>): void => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === id ? { ...cat, ...updates } : cat
      ),
    }));
  }, []);

  const deleteCategory = useCallback((id: string): void => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== id),
      // Move transactions and recurring rules with deleted category to "Other"
      transactions: prev.transactions.map(tx =>
        tx.categoryId === id ? { ...tx, categoryId: 'cat-other' } : tx
      ),
      recurringRules: prev.recurringRules.map(rule =>
        rule.categoryId === id ? { ...rule, categoryId: 'cat-other' } : rule
      ),
    }));
  }, []);

  const getCategoryById = useCallback((id: string): Category | undefined => {
    return data.categories.find(cat => cat.id === id);
  }, [data.categories]);

  // ── Recurring Rules CRUD ──
  const addRecurringRule = useCallback((rule: Omit<RecurringRule, 'id' | 'lastGeneratedDate'>): RecurringRule => {
    const newRule: RecurringRule = { ...rule, id: generateId(), lastGeneratedDate: undefined };
    setData(prev => ({ ...prev, recurringRules: [...prev.recurringRules, newRule] }));
    return newRule;
  }, []);

  const updateRecurringRule = useCallback((id: string, updates: Partial<Omit<RecurringRule, 'id'>>): void => {
    setData(prev => ({
      ...prev,
      recurringRules: prev.recurringRules.map(rule =>
        rule.id === id ? { ...rule, ...updates } : rule
      ),
    }));
  }, []);

  const deleteRecurringRule = useCallback((id: string): void => {
    setData(prev => ({
      ...prev,
      recurringRules: prev.recurringRules.filter(rule => rule.id !== id),
    }));
  }, []);

  // ── Generate Due Recurring Transactions ──
  const generateDueRecurringTransactions = useCallback((): void => {
    setData(prev => {
      const today = startOfDay(new Date());
      const newTransactions: Transaction[] = [];
      const updatedRules = prev.recurringRules.map(rule => {
        if (!rule.isActive) return rule;

        let cursor = rule.lastGeneratedDate
          ? parseISO(rule.lastGeneratedDate)
          : parseISO(rule.startDate);

        // Move cursor to the next due date after lastGenerated
        if (rule.lastGeneratedDate) {
          cursor = rule.interval === 'weekly'
            ? addWeeks(cursor, 1)
            : addMonths(cursor, 1);
        }

        let lastGenerated = rule.lastGeneratedDate;

        while (isBefore(cursor, today) || isEqual(cursor, today)) {
          const dateStr = format(cursor, 'yyyy-MM-dd');
          newTransactions.push({
            id: generateId(),
            date: dateStr,
            description: rule.description,
            amount: rule.amount,
            type: rule.type,
            categoryId: rule.categoryId,
            notes: rule.notes,
            isRecurring: true,
            recurringRuleId: rule.id,
          });
          lastGenerated = dateStr;
          cursor = rule.interval === 'weekly'
            ? addWeeks(cursor, 1)
            : addMonths(cursor, 1);
        }

        return lastGenerated !== rule.lastGeneratedDate
          ? { ...rule, lastGeneratedDate: lastGenerated }
          : rule;
      });

      if (newTransactions.length === 0) return prev;

      return {
        ...prev,
        transactions: [...prev.transactions, ...newTransactions],
        recurringRules: updatedRules,
      };
    });
  }, []);

  // ── Theme ──
  const toggleTheme = useCallback((): void => {
    setData(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  }, []);

  const setAccentColor = useCallback((color: string): void => {
    setData(prev => ({ ...prev, accentColor: color }));
  }, []);

  const setCurrency = useCallback((currency: string): void => {
    setData(prev => ({ ...prev, currency }));
  }, []);

  // ── Reset ──
  const resetData = useCallback((): void => {
    const seed = createSeedData();
    setData(seed);
  }, []);

  return {
    ...data,
    addTransaction,
    addTransactions,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    addRecurringRule,
    updateRecurringRule,
    deleteRecurringRule,
    generateDueRecurringTransactions,
    toggleTheme,
    setAccentColor,
    setCurrency,
    resetData,
  };
}
