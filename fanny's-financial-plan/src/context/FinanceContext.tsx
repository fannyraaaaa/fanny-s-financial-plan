import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  Wallet,
  Category,
  Transaction,
  RecurringTransaction,
  SavingsGoal,
  ReconciliationRecord,
  WalletTransfer,
} from '../types/finance';
import {
  INITIAL_WALLETS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_RECURRING,
  INITIAL_SAVINGS_GOALS,
  INITIAL_RECONCILIATION_LOGS,
} from '../data/initialData';
import { getTodayString } from '../utils/formatters';

interface FinanceContextType {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  transfers: WalletTransfer[];
  recurring: RecurringTransaction[];
  savingsGoals: SavingsGoal[];
  reconciliationLogs: ReconciliationRecord[];

  // Transaction methods
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;

  // Wallet methods
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  editWallet: (id: string, updates: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  transferWallet: (transfer: Omit<WalletTransfer, 'id' | 'createdAt'>) => void;

  // Category methods
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;

  // Recurring methods
  addRecurring: (rec: Omit<RecurringTransaction, 'id'>) => void;
  editRecurring: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurring: (id: string) => void;
  toggleRecurring: (id: string) => void;
  processRecurringItem: (id: string) => boolean;

  // Savings goals (wishli$t)
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  editSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  depositToGoal: (goalId: string, walletId: string, amount: number) => boolean;

  // Monthly Reconciliation method (Rekonsiliasi Akhir Bulan)
  reconcileWallet: (
    walletId: string,
    realBalance: number,
    reason?: string,
    customDate?: string
  ) => { difference: number; type: 'income' | 'expense' | 'exact' } | null;

  // Reset
  resetToDefault: () => void;

  // Calculations
  totalNetWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNetFlow: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WALLETS: 'fanny_wallets_v4_reconciliation',
  CATEGORIES: 'fanny_categories_v4_reconciliation',
  TRANSACTIONS: 'fanny_transactions_v4_reconciliation',
  TRANSFERS: 'fanny_transfers_v4_reconciliation',
  RECURRING: 'fanny_recurring_v4_reconciliation',
  SAVINGS: 'fanny_savings_v4_reconciliation',
  RECONCILIATION: 'fanny_reconciliation_v4',
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WALLETS);
    return saved ? JSON.parse(saved) : INITIAL_WALLETS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [transfers, setTransfers] = useState<WalletTransfer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
    return saved ? JSON.parse(saved) : INITIAL_RECURRING;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVINGS);
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
  });

  const [reconciliationLogs, setReconciliationLogs] = useState<ReconciliationRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECONCILIATION);
    return saved ? JSON.parse(saved) : INITIAL_RECONCILIATION_LOGS;
  });

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurring));
  }, [recurring]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECONCILIATION, JSON.stringify(reconciliationLogs));
  }, [reconciliationLogs]);

  // Add Transaction
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update wallet balance
    setWallets(prev =>
      prev.map(w => {
        if (w.id === txData.walletId) {
          const delta = txData.type === 'income' ? txData.amount : -txData.amount;
          return { ...w, balance: w.balance + delta };
        }
        return w;
      })
    );
  };

  // Delete Transaction
  const deleteTransaction = (id: string) => {
    const target = transactions.find(t => t.id === id);
    if (!target) return;

    setTransactions(prev => prev.filter(t => t.id !== id));

    // Revert balance
    setWallets(prev =>
      prev.map(w => {
        if (w.id === target.walletId) {
          const reverseDelta = target.type === 'income' ? -target.amount : target.amount;
          return { ...w, balance: w.balance + reverseDelta };
        }
        return w;
      })
    );
  };

  // Add Wallet
  const addWallet = (walletData: Omit<Wallet, 'id'>) => {
    const newWallet: Wallet = {
      ...walletData,
      id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    setWallets(prev => [...prev, newWallet]);
  };

  // Edit Wallet
  const editWallet = (id: string, updates: Partial<Wallet>) => {
    setWallets(prev => prev.map(w => (w.id === id ? { ...w, ...updates } : w)));
  };

  // Delete Wallet
  const deleteWallet = (id: string) => {
    setWallets(prev => prev.filter(w => w.id !== id));
  };

  // Transfer Antar Wallet
  const transferWallet = (transferData: Omit<WalletTransfer, 'id' | 'createdAt'>) => {
    const { fromWalletId, toWalletId, amount, adminFee, date, notes } = transferData;
    const newTransfer: WalletTransfer = {
      ...transferData,
      id: `tr-${Date.now()}`,
      createdAt: Date.now(),
    };
    setTransfers(prev => [newTransfer, ...prev]);

    const fromWallet = wallets.find(w => w.id === fromWalletId);
    const toWallet = wallets.find(w => w.id === toWalletId);

    // Update balances
    setWallets(prev =>
      prev.map(w => {
        if (w.id === fromWalletId) {
          return { ...w, balance: w.balance - (amount + adminFee) };
        }
        if (w.id === toWalletId) {
          return { ...w, balance: w.balance + amount };
        }
        return w;
      })
    );

    // Record as two clean transactions
    const expenseTx: Transaction = {
      id: `tx-tr-out-${Date.now()}`,
      type: 'expense',
      amount: amount + adminFee,
      date,
      walletId: fromWalletId,
      categoryId: 'cat-exp-bills',
      notes: `Transfer to ${toWallet?.name || 'Another wallet'}${adminFee > 0 ? ` (Admin fee Rp ${adminFee.toLocaleString('en-US')})` : ''}${notes ? `: ${notes}` : ''}`,
      createdAt: Date.now(),
    };

    const incomeTx: Transaction = {
      id: `tx-tr-in-${Date.now() + 1}`,
      type: 'income',
      amount: amount,
      date,
      walletId: toWalletId,
      categoryId: 'cat-inc-salary',
      notes: `Transfer from ${fromWallet?.name || 'Another wallet'}${notes ? `: ${notes}` : ''}`,
      createdAt: Date.now() + 1,
    };

    setTransactions(prev => [incomeTx, expenseTx, ...prev]);
  };

  // Categories
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-custom-${Date.now()}`,
      isCustom: true,
    };
    setCategories(prev => [...prev, newCat]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Recurring Transactions
  const addRecurring = (recData: Omit<RecurringTransaction, 'id'>) => {
    const newRec: RecurringTransaction = {
      ...recData,
      id: `rec-${Date.now()}`,
    };
    setRecurring(prev => [...prev, newRec]);
  };

  const editRecurring = (id: string, updates: Partial<RecurringTransaction>) => {
    setRecurring(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteRecurring = (id: string) => {
    setRecurring(prev => prev.filter(r => r.id !== id));
  };

  const toggleRecurring = (id: string) => {
    setRecurring(prev => prev.map(r => (r.id === id ? { ...r, active: !r.active } : r)));
  };

  const processRecurringItem = (id: string) => {
    const item = recurring.find(r => r.id === id);
    if (!item) return false;

    const today = getTodayString();
    addTransaction({
      type: item.type,
      amount: item.amount,
      date: today,
      walletId: item.walletId,
      categoryId: item.categoryId,
      notes: `[Auto-Debet] ${item.title}${item.notes ? ` - ${item.notes}` : ''}`,
      recurringId: item.id,
    });

    setRecurring(prev =>
      prev.map(r => (r.id === id ? { ...r, lastProcessedDate: today } : r))
    );
    return true;
  };

  // Savings Goals (wishli$t)
  const addSavingsGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    setSavingsGoals(prev => [...prev, newGoal]);
  };

  const editSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  };

  const depositToGoal = (goalId: string, walletId: string, amount: number) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    const wallet = wallets.find(w => w.id === walletId);
    if (!goal || !wallet || amount <= 0) return false;

    // Deduct from wallet
    setWallets(prev =>
      prev.map(w => (w.id === walletId ? { ...w, balance: w.balance - amount } : w))
    );

    // Record as transaction
    addTransaction({
      type: 'expense',
      amount,
      date: getTodayString(),
      walletId,
      categoryId: 'cat-exp-shopping',
      notes: `Setor ke wishli$t: ${goal.title}`,
    });

    // Update goal amount
    const updatedAmount = goal.currentAmount + amount;
    const isCompleted = updatedAmount >= goal.targetAmount;

    setSavingsGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            currentAmount: updatedAmount,
            completedAt: isCompleted ? getTodayString() : g.completedAt,
          };
        }
        return g;
      })
    );

    // Confetti celebration if completed!
    if (isCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#CB497C', '#A93361', '#E07DA4', '#F3AEC5', '#F8E9E4'],
      });
    }

    return true;
  };

  // REKONSILIASI SALDO AKHIR BULAN
  const reconcileWallet = (
    walletId: string,
    realBalance: number,
    customReason?: string,
    customDate?: string
  ) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return null;

    const diff = realBalance - wallet.balance;
    const dateToUse = customDate || getTodayString();

    let transactionType: 'income' | 'expense' | 'exact' = 'exact';
    const reasonText = customReason?.trim() || (diff >= 0 ? 'Month-End Bank Interest' : 'Bank Fees & Tax');

    if (diff > 0) {
      transactionType = 'income';
      addTransaction({
        type: 'income',
        amount: diff,
        date: dateToUse,
        walletId: wallet.id,
        categoryId: 'cat-inc-interest',
        notes: `[Month-End Reconciliation] ${reasonText}`,
        isReconciliation: true,
      });
    } else if (diff < 0) {
      transactionType = 'expense';
      addTransaction({
        type: 'expense',
        amount: Math.abs(diff),
        date: dateToUse,
        walletId: wallet.id,
        categoryId: 'cat-exp-admin',
        notes: `[Month-End Reconciliation] ${reasonText}`,
        isReconciliation: true,
      });
    }

    // Set exact balance and reconciliation date
    setWallets(prev =>
      prev.map(w =>
        w.id === walletId
          ? {
              ...w,
              balance: realBalance,
              lastReconciledDate: dateToUse,
              lastReconciledBalance: realBalance,
            }
          : w
      )
    );

    // Log record
    const record: ReconciliationRecord = {
      id: `rec-log-${Date.now()}`,
      walletId: wallet.id,
      walletName: wallet.name,
      date: dateToUse,
      appBalance: wallet.balance,
      realBalance,
      difference: diff,
      reason: reasonText,
      notes: customReason,
      createdAt: Date.now(),
    };
    setReconciliationLogs(prev => [record, ...prev]);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#CB497C', '#F3AEC5', '#E07DA4'],
    });

    return {
      difference: diff,
      type: transactionType,
    };
  };

  const resetToDefault = () => {
    setWallets(INITIAL_WALLETS);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setTransfers([]);
    setRecurring(INITIAL_RECURRING);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setReconciliationLogs(INITIAL_RECONCILIATION_LOGS);
    localStorage.clear();
  };

  // KPI Calculations
  const totalNetWorth = wallets.reduce((acc, w) => acc + w.balance, 0);

  const currentMonthPrefix = getTodayString().slice(0, 7); // YYYY-MM
  const thisMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonthPrefix));

  const monthlyIncome = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpense = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyNetFlow = monthlyIncome - monthlyExpense;

  return (
    <FinanceContext.Provider
      value={{
        wallets,
        categories,
        transactions,
        transfers,
        recurring,
        savingsGoals,
        reconciliationLogs,
        addTransaction,
        deleteTransaction,
        addWallet,
        editWallet,
        deleteWallet,
        transferWallet,
        addCategory,
        deleteCategory,
        addRecurring,
        editRecurring,
        deleteRecurring,
        toggleRecurring,
        processRecurringItem,
        addSavingsGoal,
        editSavingsGoal,
        deleteSavingsGoal,
        depositToGoal,
        reconcileWallet,
        resetToDefault,
        totalNetWorth,
        monthlyIncome,
        monthlyExpense,
        monthlyNetFlow,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
