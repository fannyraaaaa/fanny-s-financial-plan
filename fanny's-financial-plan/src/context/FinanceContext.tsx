import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
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
import {
  db,
  auth,
  ensureAuthenticated,
  doc,
  onSnapshot,
  setDoc,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

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

  // Savings goals (wi$h li$t)
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  editSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  depositToGoal: (goalId: string, walletId: string, amount: number) => boolean;

  // Monthly Reconciliation method
  reconcileWallet: (
    walletId: string,
    realBalance: number,
    reason?: string,
    customDate?: string
  ) => { difference: number; type: 'income' | 'expense' | 'exact' } | null;

  // Password Vault Security
  isUnlocked: boolean;
  unlockVault: (password: string) => boolean;
  lockVault: () => void;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; error?: string };
  resetPasswordToDefault: () => void;
  hasCustomPassword: boolean;

  // Reset
  resetToDefault: () => void;

  // Multi-Device Cloud Sync
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  syncNow: () => Promise<void>;

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
  VAULT_PASSWORD: 'fanny_vault_password_v1',
};

const DEFAULT_VAULT_PASSWORD = 'fanny123';
const WORKSPACE_DOC_ID = 'fanny_vault';

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Vault Security State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [vaultPassword, setVaultPassword] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.VAULT_PASSWORD) || DEFAULT_VAULT_PASSWORD;
  });

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

  // Cloud Sync Status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Track if an update comes from Firestore remote to avoid echo loops
  const isRemoteUpdatingRef = useRef<boolean>(false);
  const isInitialSnapshotLoadedRef = useRef<boolean>(false);

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

  // Push current state to Firestore
  const saveToFirestore = useCallback(
    async (overrideData?: {
      wallets?: Wallet[];
      categories?: Category[];
      transactions?: Transaction[];
      transfers?: WalletTransfer[];
      recurring?: RecurringTransaction[];
      savingsGoals?: SavingsGoal[];
      reconciliationLogs?: ReconciliationRecord[];
      vaultPassword?: string;
    }) => {
      try {
        setSyncStatus('syncing');

        const payload = {
          id: WORKSPACE_DOC_ID,
          name: "Fanny's Financial Plan",
          wallets: overrideData?.wallets ?? wallets,
          categories: overrideData?.categories ?? categories,
          transactions: overrideData?.transactions ?? transactions,
          transfers: overrideData?.transfers ?? transfers,
          recurring: overrideData?.recurring ?? recurring,
          savingsGoals: overrideData?.savingsGoals ?? savingsGoals,
          reconciliationLogs: overrideData?.reconciliationLogs ?? reconciliationLogs,
          vaultPassword: overrideData?.vaultPassword ?? vaultPassword,
          updatedAt: new Date().toISOString(),
          updatedBy: 'fanny_app',
        };

        const docRef = doc(db, 'financial_workspaces', WORKSPACE_DOC_ID);
        await setDoc(docRef, payload);

        setSyncStatus('synced');
        setLastSyncedAt(new Date());
      } catch (err) {
        console.error('Failed to sync to Firestore:', err);
        setSyncStatus('error');
      }
    },
    [wallets, categories, transactions, transfers, recurring, savingsGoals, reconciliationLogs, vaultPassword]
  );

  // Firestore Real-Time Listener on boot
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;
    let isMounted = true;

    async function initFirestoreSync() {
      try {
        setSyncStatus('syncing');

        const docRef = doc(db, 'financial_workspaces', WORKSPACE_DOC_ID);

        unsubscribeSnapshot = onSnapshot(
          docRef,
          snapshot => {
            if (!isMounted) return;

            if (snapshot.exists()) {
              const data = snapshot.data();
              isRemoteUpdatingRef.current = true;

              if (Array.isArray(data.wallets)) setWallets(data.wallets);
              if (Array.isArray(data.categories)) setCategories(data.categories);
              if (Array.isArray(data.transactions)) setTransactions(data.transactions);
              if (Array.isArray(data.transfers)) setTransfers(data.transfers);
              if (Array.isArray(data.recurring)) setRecurring(data.recurring);
              if (Array.isArray(data.savingsGoals)) setSavingsGoals(data.savingsGoals);
              if (Array.isArray(data.reconciliationLogs)) setReconciliationLogs(data.reconciliationLogs);
              if (typeof data.vaultPassword === 'string') {
                setVaultPassword(data.vaultPassword);
                localStorage.setItem(STORAGE_KEYS.VAULT_PASSWORD, data.vaultPassword);
              }

              if (data.updatedAt) {
                setLastSyncedAt(new Date(data.updatedAt));
              } else {
                setLastSyncedAt(new Date());
              }

              setSyncStatus('synced');
              isInitialSnapshotLoadedRef.current = true;

              setTimeout(() => {
                isRemoteUpdatingRef.current = false;
              }, 200);
            } else {
              // First time: the cloud document does not exist yet.
              // Upload the initial data from this device to Firestore so other devices can receive it!
              isInitialSnapshotLoadedRef.current = true;
              saveToFirestore();
            }
          },
          error => {
            console.error('Firestore onSnapshot error:', error);
            if (isMounted) {
              setSyncStatus('error');
            }
          }
        );
      } catch (error) {
        console.error('Failed to initialize Firestore listener:', error);
        if (isMounted) {
          setSyncStatus('offline');
        }
      }
    }

    initFirestoreSync();

    return () => {
      isMounted = false;
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  // Vault Security methods
  const unlockVault = (enteredPassword: string): boolean => {
    if (enteredPassword.trim() === vaultPassword) {
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  const lockVault = () => {
    setIsUnlocked(false);
  };

  const changePassword = (
    oldPassword: string,
    newPassword: string
  ): { success: boolean; error?: string } => {
    if (oldPassword.trim() !== vaultPassword) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    if (!newPassword || newPassword.trim().length < 3) {
      return { success: false, error: 'New password must be at least 3 characters.' };
    }
    const clean = newPassword.trim();
    setVaultPassword(clean);
    localStorage.setItem(STORAGE_KEYS.VAULT_PASSWORD, clean);
    saveToFirestore({ vaultPassword: clean });
    return { success: true };
  };

  const resetPasswordToDefault = () => {
    setVaultPassword(DEFAULT_VAULT_PASSWORD);
    localStorage.removeItem(STORAGE_KEYS.VAULT_PASSWORD);
    saveToFirestore({ vaultPassword: DEFAULT_VAULT_PASSWORD });
  };

  const hasCustomPassword = vaultPassword !== DEFAULT_VAULT_PASSWORD;

  // Add Transaction
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
    };

    const nextTxs = [newTx, ...transactions];
    const nextWallets = wallets.map(w => {
      if (w.id === txData.walletId) {
        const delta = txData.type === 'income' ? txData.amount : -txData.amount;
        return { ...w, balance: w.balance + delta };
      }
      return w;
    });

    setTransactions(nextTxs);
    setWallets(nextWallets);
    saveToFirestore({ transactions: nextTxs, wallets: nextWallets });
  };

  // Delete Transaction
  const deleteTransaction = (id: string) => {
    const target = transactions.find(t => t.id === id);
    if (!target) return;

    const nextTxs = transactions.filter(t => t.id !== id);
    const nextWallets = wallets.map(w => {
      if (w.id === target.walletId) {
        const reverseDelta = target.type === 'income' ? -target.amount : target.amount;
        return { ...w, balance: w.balance + reverseDelta };
      }
      return w;
    });

    setTransactions(nextTxs);
    setWallets(nextWallets);
    saveToFirestore({ transactions: nextTxs, wallets: nextWallets });
  };

  // Add Wallet
  const addWallet = (walletData: Omit<Wallet, 'id'>) => {
    const newWallet: Wallet = {
      ...walletData,
      id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    const nextWallets = [...wallets, newWallet];
    setWallets(nextWallets);
    saveToFirestore({ wallets: nextWallets });
  };

  // Edit Wallet
  const editWallet = (id: string, updates: Partial<Wallet>) => {
    const nextWallets = wallets.map(w => (w.id === id ? { ...w, ...updates } : w));
    setWallets(nextWallets);
    saveToFirestore({ wallets: nextWallets });
  };

  // Delete Wallet
  const deleteWallet = (id: string) => {
    const nextWallets = wallets.filter(w => w.id !== id);
    setWallets(nextWallets);
    saveToFirestore({ wallets: nextWallets });
  };

  // Transfer Antar Wallet
  const transferWallet = (transferData: Omit<WalletTransfer, 'id' | 'createdAt'>) => {
    const { fromWalletId, toWalletId, amount, adminFee, date, notes } = transferData;
    const newTransfer: WalletTransfer = {
      ...transferData,
      id: `tr-${Date.now()}`,
      createdAt: Date.now(),
    };
    const nextTransfers = [newTransfer, ...transfers];

    const fromWallet = wallets.find(w => w.id === fromWalletId);
    const toWallet = wallets.find(w => w.id === toWalletId);

    // Update balances
    const nextWallets = wallets.map(w => {
      if (w.id === fromWalletId) {
        return { ...w, balance: w.balance - (amount + adminFee) };
      }
      if (w.id === toWalletId) {
        return { ...w, balance: w.balance + amount };
      }
      return w;
    });

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

    const nextTransactions = [incomeTx, expenseTx, ...transactions];

    setTransfers(nextTransfers);
    setWallets(nextWallets);
    setTransactions(nextTransactions);

    saveToFirestore({
      transfers: nextTransfers,
      wallets: nextWallets,
      transactions: nextTransactions,
    });
  };

  // Categories
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-custom-${Date.now()}`,
      isCustom: true,
    };
    const nextCategories = [...categories, newCat];
    setCategories(nextCategories);
    saveToFirestore({ categories: nextCategories });
  };

  const deleteCategory = (id: string) => {
    const nextCategories = categories.filter(c => c.id !== id);
    setCategories(nextCategories);
    saveToFirestore({ categories: nextCategories });
  };

  // Recurring Transactions
  const addRecurring = (recData: Omit<RecurringTransaction, 'id'>) => {
    const newRec: RecurringTransaction = {
      ...recData,
      id: `rec-${Date.now()}`,
    };
    const nextRecurring = [...recurring, newRec];
    setRecurring(nextRecurring);
    saveToFirestore({ recurring: nextRecurring });
  };

  const editRecurring = (id: string, updates: Partial<RecurringTransaction>) => {
    const nextRecurring = recurring.map(r => (r.id === id ? { ...r, ...updates } : r));
    setRecurring(nextRecurring);
    saveToFirestore({ recurring: nextRecurring });
  };

  const deleteRecurring = (id: string) => {
    const nextRecurring = recurring.filter(r => r.id !== id);
    setRecurring(nextRecurring);
    saveToFirestore({ recurring: nextRecurring });
  };

  const toggleRecurring = (id: string) => {
    const nextRecurring = recurring.map(r => (r.id === id ? { ...r, active: !r.active } : r));
    setRecurring(nextRecurring);
    saveToFirestore({ recurring: nextRecurring });
  };

  const processRecurringItem = (id: string) => {
    const item = recurring.find(r => r.id === id);
    if (!item) return false;

    const today = getTodayString();
    const newTx: Transaction = {
      id: `tx-rec-${Date.now()}`,
      type: item.type,
      amount: item.amount,
      date: today,
      walletId: item.walletId,
      categoryId: item.categoryId,
      notes: `[Auto-Debet] ${item.title}${item.notes ? ` - ${item.notes}` : ''}`,
      recurringId: item.id,
      createdAt: Date.now(),
    };

    const nextTxs = [newTx, ...transactions];
    const nextWallets = wallets.map(w => {
      if (w.id === item.walletId) {
        const delta = item.type === 'income' ? item.amount : -item.amount;
        return { ...w, balance: w.balance + delta };
      }
      return w;
    });

    const nextRecurring = recurring.map(r =>
      r.id === id ? { ...r, lastProcessedDate: today } : r
    );

    setTransactions(nextTxs);
    setWallets(nextWallets);
    setRecurring(nextRecurring);

    saveToFirestore({
      transactions: nextTxs,
      wallets: nextWallets,
      recurring: nextRecurring,
    });

    return true;
  };

  // Savings Goals (wi$h li$t)
  const addSavingsGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    const nextGoals = [...savingsGoals, newGoal];
    setSavingsGoals(nextGoals);
    saveToFirestore({ savingsGoals: nextGoals });
  };

  const editSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    const nextGoals = savingsGoals.map(g => (g.id === id ? { ...g, ...updates } : g));
    setSavingsGoals(nextGoals);
    saveToFirestore({ savingsGoals: nextGoals });
  };

  const deleteSavingsGoal = (id: string) => {
    const nextGoals = savingsGoals.filter(g => g.id !== id);
    setSavingsGoals(nextGoals);
    saveToFirestore({ savingsGoals: nextGoals });
  };

  const depositToGoal = (goalId: string, walletId: string, amount: number) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    const wallet = wallets.find(w => w.id === walletId);
    if (!goal || !wallet || amount <= 0) return false;

    // Deduct from wallet
    const nextWallets = wallets.map(w =>
      w.id === walletId ? { ...w, balance: w.balance - amount } : w
    );

    // Record as transaction
    const depositTx: Transaction = {
      id: `tx-dep-${Date.now()}`,
      type: 'expense',
      amount,
      date: getTodayString(),
      walletId,
      categoryId: 'cat-exp-shopping',
      notes: `Deposit to wi$h li$t: ${goal.title}`,
      createdAt: Date.now(),
    };
    const nextTxs = [depositTx, ...transactions];

    // Update goal amount
    const updatedAmount = goal.currentAmount + amount;
    const isCompleted = updatedAmount >= goal.targetAmount;

    const nextGoals = savingsGoals.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          currentAmount: updatedAmount,
          completedAt: isCompleted ? getTodayString() : g.completedAt,
        };
      }
      return g;
    });

    setWallets(nextWallets);
    setTransactions(nextTxs);
    setSavingsGoals(nextGoals);

    saveToFirestore({
      wallets: nextWallets,
      transactions: nextTxs,
      savingsGoals: nextGoals,
    });

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

    let nextTxs = [...transactions];

    if (diff > 0) {
      transactionType = 'income';
      const adjTx: Transaction = {
        id: `tx-rec-diff-${Date.now()}`,
        type: 'income',
        amount: diff,
        date: dateToUse,
        walletId: wallet.id,
        categoryId: 'cat-inc-interest',
        notes: `[Month-End Reconciliation] ${reasonText}`,
        isReconciliation: true,
        createdAt: Date.now(),
      };
      nextTxs = [adjTx, ...nextTxs];
    } else if (diff < 0) {
      transactionType = 'expense';
      const adjTx: Transaction = {
        id: `tx-rec-diff-${Date.now()}`,
        type: 'expense',
        amount: Math.abs(diff),
        date: dateToUse,
        walletId: wallet.id,
        categoryId: 'cat-exp-admin',
        notes: `[Month-End Reconciliation] ${reasonText}`,
        isReconciliation: true,
        createdAt: Date.now(),
      };
      nextTxs = [adjTx, ...nextTxs];
    }

    // Set exact balance and reconciliation date
    const nextWallets = wallets.map(w =>
      w.id === walletId
        ? {
            ...w,
            balance: realBalance,
            lastReconciledDate: dateToUse,
            lastReconciledBalance: realBalance,
          }
        : w
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
    const nextLogs = [record, ...reconciliationLogs];

    setTransactions(nextTxs);
    setWallets(nextWallets);
    setReconciliationLogs(nextLogs);

    saveToFirestore({
      transactions: nextTxs,
      wallets: nextWallets,
      reconciliationLogs: nextLogs,
    });

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
    setVaultPassword(DEFAULT_VAULT_PASSWORD);
    localStorage.clear();

    saveToFirestore({
      wallets: INITIAL_WALLETS,
      categories: INITIAL_CATEGORIES,
      transactions: INITIAL_TRANSACTIONS,
      transfers: [],
      recurring: INITIAL_RECURRING,
      savingsGoals: INITIAL_SAVINGS_GOALS,
      reconciliationLogs: INITIAL_RECONCILIATION_LOGS,
      vaultPassword: DEFAULT_VAULT_PASSWORD,
    });
  };

  const syncNow = async () => {
    await saveToFirestore();
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
        isUnlocked,
        unlockVault,
        lockVault,
        changePassword,
        resetPasswordToDefault,
        hasCustomPassword,
        resetToDefault,
        syncStatus,
        lastSyncedAt,
        syncNow,
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
