import { Wallet, Category, Transaction, RecurringTransaction, SavingsGoal, ReconciliationRecord } from '../types/finance';
import { PALETTE } from '../utils/formatters';

// Clean empty slate (no dummy wallets, no dummy balances)
export const INITIAL_WALLETS: Wallet[] = [];

// Default Expense Categories
export const INITIAL_CATEGORIES: Category[] = [
  // Basic Expenses
  { id: 'cat-exp-food', name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: PALETTE.berryRose },
  { id: 'cat-exp-shopping', name: 'Shopping & Groceries', type: 'expense', icon: 'ShoppingBag', color: PALETTE.deepRose },
  { id: 'cat-exp-transport', name: 'Transport & Fuel', type: 'expense', icon: 'Car', color: PALETTE.richPlum },
  { id: 'cat-exp-bills', name: 'Bills & Utilities', type: 'expense', icon: 'Zap', color: PALETTE.rosePink },
  { id: 'cat-exp-rent', name: 'Rent & Housing', type: 'expense', icon: 'Home', color: PALETTE.darkCherry },
  { id: 'cat-exp-entertainment', name: 'Entertainment', type: 'expense', icon: 'Sparkles', color: PALETTE.softPink },
  { id: 'cat-exp-health', name: 'Healthcare & Beauty', type: 'expense', icon: 'HeartPulse', color: PALETTE.berryRose },
  { id: 'cat-exp-admin', name: 'Bank Fees & Tax', type: 'expense', icon: 'Coins', color: PALETTE.darkCherry },
  
  // Basic Incomes
  { id: 'cat-inc-salary', name: 'Monthly Salary', type: 'income', icon: 'Briefcase', color: PALETTE.richPlum },
  { id: 'cat-inc-freelance', name: 'Freelance & Business', type: 'income', icon: 'Laptop', color: PALETTE.deepRose },
  { id: 'cat-inc-interest', name: 'Month-End Bank Interest', type: 'income', icon: 'TrendingUp', color: PALETTE.berryRose },
  { id: 'cat-inc-cashback', name: 'Cashback & Promo', type: 'income', icon: 'Gift', color: PALETTE.rosePink },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_RECURRING: RecurringTransaction[] = [];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [];

export const INITIAL_RECONCILIATION_LOGS: ReconciliationRecord[] = [];
