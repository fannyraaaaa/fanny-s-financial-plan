export type TransactionType = 'income' | 'expense';

export type WalletType = 'cash' | 'debit' | 'credit' | 'ewallet' | 'savings' | 'custom';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  typeLabel: string;
  balance: number;
  color: string; // hex color from our aesthetic palette
  icon: string;
  accountNumber?: string;
  lastReconciledDate?: string;
  lastReconciledBalance?: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  walletId: string;
  categoryId?: string;
  notes: string;
  isReconciliation?: boolean;
  isTransfer?: boolean;
  transferId?: string;
  recurringId?: string;
  createdAt: number;
}

export interface WalletTransfer {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  adminFee: number;
  date: string;
  notes: string;
  createdAt: number;
}

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  walletId: string;
  categoryId: string;
  dayOfMonth: number; // 1 - 31
  active: boolean;
  notes: string;
  lastProcessedDate?: string | null;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  color: string;
  icon: string;
  notes?: string;
  completedAt?: string;
}

export interface ReconciliationRecord {
  id: string;
  walletId: string;
  walletName: string;
  date: string;
  appBalance: number;
  realBalance: number;
  difference: number;
  reason: string; // e.g. "Month-End Bank Interest", "Bank Fees & Tax", "Balance Adjustment"
  notes?: string;
  createdAt: number;
}
