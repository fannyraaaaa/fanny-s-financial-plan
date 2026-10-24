import * as XLSX from 'xlsx';
import { Wallet, Transaction, Category, RecurringTransaction, SavingsGoal, ReconciliationRecord } from '../types/finance';
import { getTodayString } from './formatters';

export interface SpreadsheetDataPackage {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  recurring: RecurringTransaction[];
  savingsGoals: SavingsGoal[];
  reconciliationLogs: ReconciliationRecord[];
}

export function exportFinancialSpreadsheet(
  data: SpreadsheetDataPackage,
  filename = `fannys_financial_plan_${getTodayString()}.xlsx`,
  isUnlocked = true
) {
  if (!isUnlocked) {
    console.warn('Export Excel blocked: vault is locked.');
    return false;
  }
  const wb = XLSX.utils.book_new();

  // 1. Ringkasan Eksekutif (Summary)
  const isTrTx = (t: Transaction) =>
    t.isTransfer ||
    t.id?.startsWith('tx-tr-') ||
    t.notes?.startsWith('Transfer to ') ||
    t.notes?.startsWith('Transfer from ');

  const totalBalance = data.wallets.reduce((acc, w) => acc + w.balance, 0);
  const totalIncome = data.transactions
    .filter(t => t.type === 'income' && !isTrTx(t))
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = data.transactions
    .filter(t => t.type === 'expense' && !isTrTx(t))
    .reduce((acc, t) => acc + t.amount, 0);
  const totalSavings = data.savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);

  const summaryRows = [
    ['FANNY\'S FINANCIAL PLAN - SPREADSHEET', ''],
    ['Export Date', new Date().toLocaleString('en-US')],
    ['', ''],
    ['FINANCIAL METRIC', 'AMOUNT (IDR)'],
    ['Total Net Worth', totalBalance],
    ['Total Recorded Income', totalIncome],
    ['Total Recorded Expense', totalExpense],
    ['Net Cash Flow', totalIncome - totalExpense],
    ['Total Saved in wi$h li$t', totalSavings],
    ['', ''],
    ['Accounting System', 'Real-time bookkeeping with month-end bank balance reconciliation'],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // 2. Transaksi (Transactions)
  const catMap = new Map(data.categories.map(c => [c.id, c.name]));
  const walletMap = new Map(data.wallets.map(w => [w.id, w.name]));

  const transactionRows = data.transactions.map((tx, idx) => {
    const isTransfer = isTrTx(tx);
    return {
      No: idx + 1,
      Date: tx.date,
      Type: tx.type === 'income' ? 'Income' : 'Expense',
      Category: isTransfer ? 'Transfer' : (catMap.get(tx.categoryId || '') || 'Other'),
      'Wallet / Account': walletMap.get(tx.walletId) || 'Unknown',
      'Amount (IDR)': tx.amount,
      'Notes / Description': tx.notes || '-',
    };
  });
  const wsTx = XLSX.utils.json_to_sheet(transactionRows);
  XLSX.utils.book_append_sheet(wb, wsTx, 'Transactions');

  // 3. Wallets & Accounts
  const walletRows = data.wallets.map((w, idx) => ({
    No: idx + 1,
    'Wallet / Account Name': w.name,
    Category: w.typeLabel,
    'Account Number / Info': w.accountNumber || '-',
    'Current Balance (IDR)': w.balance,
    'Last Reconciled': w.lastReconciledDate || 'Never Reconciled',
  }));
  const wsWallets = XLSX.utils.json_to_sheet(walletRows);
  XLSX.utils.book_append_sheet(wb, wsWallets, 'Wallets & Accounts');

  // 4. Recurring Transactions
  const recurringRows = data.recurring.map((rec, idx) => ({
    No: idx + 1,
    'Recurring Schedule Title': rec.title,
    'Amount (IDR)': rec.amount,
    'Monthly Schedule': `Every Day ${rec.dayOfMonth}`,
    'Source Wallet': walletMap.get(rec.walletId) || '-',
    Category: catMap.get(rec.categoryId) || '-',
    Status: rec.active ? 'Active' : 'Paused',
    'Last Processed': rec.lastProcessedDate || 'Never',
    Notes: rec.notes || '-',
  }));
  const wsRecurring = XLSX.utils.json_to_sheet(recurringRows);
  XLSX.utils.book_append_sheet(wb, wsRecurring, 'Recurring');

  // 5. wi$h li$t (Savings Goals)
  const savingsRows = data.savingsGoals.map((g, idx) => {
    const progress = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
    return {
      No: idx + 1,
      'wi$h li$t Title': g.title,
      'Target Amount (IDR)': g.targetAmount,
      'Saved (IDR)': g.currentAmount,
      'Remaining (IDR)': Math.max(0, g.targetAmount - g.currentAmount),
      'Progress %': `${progress}%`,
      Deadline: g.targetDate,
      Notes: g.notes || '-',
    };
  });
  const wsSavings = XLSX.utils.json_to_sheet(savingsRows);
  XLSX.utils.book_append_sheet(wb, wsSavings, 'wi$h li$t');

  // 6. Month-End Reconciliation
  const recRows = data.reconciliationLogs.map((log, idx) => ({
    No: idx + 1,
    Date: log.date,
    'Account Name': log.walletName,
    'App Balance': log.appBalance,
    'Real M-Banking Balance': log.realBalance,
    Difference: log.difference,
    'Reason / Adjustment': log.reason,
  }));
  const wsRec = XLSX.utils.json_to_sheet(recRows);
  XLSX.utils.book_append_sheet(wb, wsRec, 'Reconciliation');

  // Download trigger
  XLSX.writeFile(wb, filename);
}

/**
 * Generate CSV template
 */
export function exportTransactionsCSV(
  transactions: Transaction[],
  categories: Category[],
  wallets: Wallet[],
  isUnlocked = true
) {
  if (!isUnlocked) {
    console.warn('Export CSV blocked: vault is locked.');
    return false;
  }
  const catMap = new Map(categories.map(c => [c.id, c.name]));
  const walletMap = new Map(wallets.map(w => [w.id, w.name]));

  const headers = ['Date', 'Type', 'Category', 'Wallet', 'Amount', 'Notes'];
  const rows = transactions.map(t => {
    const isTransfer =
      t.isTransfer ||
      t.id?.startsWith('tx-tr-') ||
      t.notes?.startsWith('Transfer to ') ||
      t.notes?.startsWith('Transfer from ');
    return [
      t.date,
      t.type === 'income' ? 'Income' : 'Expense',
      `"${isTransfer ? 'Transfer' : (catMap.get(t.categoryId || '') || '')}"`,
      `"${walletMap.get(t.walletId) || ''}"`,
      t.amount,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `template_transaksi_${getTodayString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
