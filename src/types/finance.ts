export type TransactionType = 'income' | 'expense';
export type RecurrenceInterval = 'weekly' | 'monthly';

export interface Category {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  description: string;
  amount: number; // stored in cents
  type: TransactionType;
  categoryId: string;
  notes: string;
  isRecurring: boolean;
  recurringRuleId?: string;
}

export interface RecurringRule {
  id: string;
  description: string;
  amount: number; // cents
  type: TransactionType;
  categoryId: string;
  notes: string;
  interval: RecurrenceInterval;
  startDate: string; // ISO date YYYY-MM-DD
  lastGeneratedDate?: string; // ISO date of last auto-generated transaction
  isActive: boolean;
}

export interface FinanceData {
  version: number;
  transactions: Transaction[];
  categories: Category[];
  recurringRules: RecurringRule[];
  theme: 'light' | 'dark';
  accentColor?: string;
  currency?: string;
}

export interface FinanceStore extends FinanceData {
  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => Transaction;
  addTransactions: (txs: Omit<Transaction, 'id'>[]) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void;
  deleteTransaction: (id: string) => void;
  getTransaction: (id: string) => Transaction | undefined;

  // Categories
  addCategory: (cat: Omit<Category, 'id' | 'isDefault'>) => Category;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id' | 'isDefault'>>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;

  // Recurring Rules
  addRecurringRule: (rule: Omit<RecurringRule, 'id' | 'lastGeneratedDate'>) => RecurringRule;
  updateRecurringRule: (id: string, updates: Partial<Omit<RecurringRule, 'id'>>) => void;
  deleteRecurringRule: (id: string) => void;
  generateDueRecurringTransactions: () => void;

  // Theme
  toggleTheme: () => void;
  setAccentColor: (color: string) => void;
  setCurrency: (currency: string) => void;

  // Utilities
  resetData: () => void;
}
