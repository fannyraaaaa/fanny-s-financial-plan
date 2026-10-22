import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  RefreshCw,
  Play,
  CheckCircle2,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  Scale,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { TransactionType, RecurringTransaction } from '../types/finance';
import { formatIDR, formatDateIndo } from '../utils/formatters';
import { IconRenderer } from './IconRenderer';

interface TransactionsViewProps {
  onOpenTransaction: (type: TransactionType) => void;
  onOpenRecurringModal?: (item?: RecurringTransaction) => void;
  onOpenTransfer?: () => void;
  onOpenReconciliation?: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenTransaction,
  onOpenRecurringModal,
  onOpenTransfer,
  onOpenReconciliation,
}) => {
  const {
    transactions,
    categories,
    wallets,
    deleteTransaction,
    recurring,
    deleteRecurring,
    toggleRecurring,
    processRecurringItem,
    isUnlocked,
    unlockVault,
    hasCustomPassword,
    openPasswordModal,
  } = useFinance();

  // Sub-tabs inside Transactions
  const [subTab, setSubTab] = useState<'transactions' | 'recurring'>('transactions');

  // Filter state for transactions
  const [activeFilter, setActiveFilter] = useState<'all' | 'expense' | 'income' | 'reconciliation'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('all');

  // Recurring state
  const [processedId, setProcessedId] = useState<string | null>(null);

  const catMap = new Map(categories.map(c => [c.id, c]));
  const walletMap = new Map(wallets.map(w => [w.id, w]));

  const handleProcess = (id: string) => {
    const success = processRecurringItem(id);
    if (success) {
      setProcessedId(id);
      setTimeout(() => setProcessedId(null), 2500);
    }
  };

  // IF LOCKED: Show clean locked screen with Tap to Unlock
  if (!isUnlocked) {
    return (
      <div className="max-w-lg mx-auto py-10 px-4 space-y-6 animate-fade-in">
        {/* Lock Hero Card */}
        <div
          onClick={openPasswordModal}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F8E9E4] hover:border-[#CB497C]/60 shadow-xl text-center space-y-4 cursor-pointer transition-all group"
          title="Tap to unlock"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#6D1B3E] via-[#A93361] to-[#CB497C] text-white flex items-center justify-center shadow-lg shadow-[#6D1B3E]/15 group-hover:scale-105 transition-transform">
            <Lock size={26} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#390F1E] font-serif-brand">
              Transactions are Protected
            </h2>
            <p className="text-xs text-[#A93361] max-w-sm mx-auto">
              Semua catatan transaksi dilindungi password. Tap tombol di bawah untuk membuka akses.
            </p>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openPasswordModal();
              }}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#6D1B3E] to-[#CB497C] hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Lock size={15} />
              <span>Tap to Unlock / Masukkan Password</span>
            </button>
          </div>

          {/* Quick Record Without Password Reminder */}
          <div className="pt-4 border-t border-[#F8E9E4]">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-bold text-[#6D1B3E]">
                Record without password:
              </p>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                No Password Needed
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onOpenTransaction('expense')}
                className="p-2.5 rounded-2xl bg-[#FAF4F2] hover:bg-[#F8E9E4] border border-[#F8E9E4] text-center transition-all group"
              >
                <div className="w-8 h-8 mx-auto rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <TrendingDown size={15} />
                </div>
                <span className="text-[10px] font-bold text-[#390F1E] block truncate">
                  Expense
                </span>
              </button>

              <button
                type="button"
                onClick={() => onOpenTransaction('income')}
                className="p-2.5 rounded-2xl bg-[#FAF4F2] hover:bg-[#F8E9E4] border border-[#F8E9E4] text-center transition-all group"
              >
                <div className="w-8 h-8 mx-auto rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <TrendingUp size={15} />
                </div>
                <span className="text-[10px] font-bold text-[#390F1E] block truncate">
                  Income
                </span>
              </button>

              {onOpenTransfer && (
                <button
                  type="button"
                  onClick={onOpenTransfer}
                  className="p-2.5 rounded-2xl bg-[#FAF4F2] hover:bg-[#F8E9E4] border border-[#F8E9E4] text-center transition-all group"
                >
                  <div className="w-8 h-8 mx-auto rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                    <ArrowRightLeft size={15} />
                  </div>
                  <span className="text-[10px] font-bold text-[#390F1E] block truncate">
                    Transfer
                  </span>
                </button>
              )}

              {onOpenReconciliation && (
                <button
                  type="button"
                  onClick={onOpenReconciliation}
                  className="p-2.5 rounded-2xl bg-[#FAF4F2] hover:bg-[#F8E9E4] border border-[#F8E9E4] text-center transition-all group"
                >
                  <div className="w-8 h-8 mx-auto rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                    <Scale size={15} />
                  </div>
                  <span className="text-[10px] font-bold text-[#390F1E] block truncate">
                    Reconcile
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED VIEW: Full Transactions & Auto Recurring
  const filteredTransactions = transactions.filter(tx => {
    if (activeFilter === 'expense' && tx.type !== 'expense') return false;
    if (activeFilter === 'income' && tx.type !== 'income') return false;
    if (activeFilter === 'reconciliation' && !tx.isReconciliation) return false;

    if (selectedWalletId !== 'all' && tx.walletId !== selectedWalletId) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const catName = (catMap.get(tx.categoryId)?.name || '').toLowerCase();
      const walName = (walletMap.get(tx.walletId)?.name || '').toLowerCase();
      const notes = (tx.notes || '').toLowerCase();
      return catName.includes(q) || walName.includes(q) || notes.includes(q) || tx.date.includes(q);
    }

    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#390F1E] font-serif-brand">
            Transactions
          </h1>
          <p className="text-xs text-[#A93361]">
            {subTab === 'transactions'
              ? `Total ${transactions.length} recorded transactions`
              : `${recurring.length} automated recurring schedules`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'transactions' ? (
            <button
              onClick={() => onOpenTransaction('expense')}
              className="px-3.5 py-2 rounded-xl bg-[#CB497C] hover:bg-[#A93361] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={16} />
              <span>New Entry</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenRecurringModal && onOpenRecurringModal()}
              className="px-3.5 py-2 rounded-xl bg-[#CB497C] hover:bg-[#A93361] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={16} />
              <span>New Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs: Transactions vs Auto Recurring */}
      <div className="grid grid-cols-2 p-1 bg-[#F8E9E4] rounded-2xl">
        <button
          onClick={() => setSubTab('transactions')}
          className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'transactions'
              ? 'bg-white text-[#CB497C] shadow-xs'
              : 'text-[#6D1B3E] hover:text-[#390F1E]'
          }`}
        >
          <span>All Transactions ({transactions.length})</span>
        </button>

        <button
          onClick={() => setSubTab('recurring')}
          className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'recurring'
              ? 'bg-white text-[#6D1B3E] shadow-xs'
              : 'text-[#6D1B3E] hover:text-[#390F1E]'
          }`}
        >
          <RefreshCw size={14} />
          <span>Auto Recurring ({recurring.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: TRANSACTIONS LIST */}
      {subTab === 'transactions' && (
        <div className="space-y-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF4F2] border border-[#F8E9E4] rounded-2xl overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'expense', label: '💸 Expense' },
              { id: 'income', label: '💰 Income' },
              { id: 'reconciliation', label: '⚖️ Reconciliation' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  activeFilter === tab.id
                    ? 'bg-white text-[#CB497C] shadow-xs'
                    : 'text-[#6D1B3E] hover:text-[#390F1E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Wallet Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-2xl border border-[#F3AEC5]/40 shadow-xs">
              <Search size={16} className="text-[#A93361]" />
              <input
                type="text"
                placeholder="Search transaction, category, or notes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs text-[#390F1E] outline-none placeholder:text-[#F3AEC5]"
              />
            </div>

            <select
              value={selectedWalletId}
              onChange={e => setSelectedWalletId(e.target.value)}
              className="bg-white text-xs font-semibold px-3 py-2.5 rounded-2xl border border-[#F3AEC5]/40 text-[#6D1B3E] outline-none shadow-xs"
            >
              <option value="all">All Wallets & Accounts</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Transactions Table/List */}
          <div className="bg-white rounded-2xl border border-[#F8E9E4] shadow-xs divide-y divide-[#F8E9E4] overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs text-slate-500 font-medium">No matching transactions found.</p>
                <button
                  onClick={() => onOpenTransaction('expense')}
                  className="px-3.5 py-1.5 text-xs font-bold text-[#CB497C] bg-[#FAF4F2] rounded-xl hover:bg-[#F8E9E4]"
                >
                  + Record New Transaction
                </button>
              </div>
            ) : (
              filteredTransactions.map(tx => {
                const cat = catMap.get(tx.categoryId);
                const wal = walletMap.get(tx.walletId);
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-[#FAF4F2]/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: cat?.color || '#CB497C' }}
                      >
                        <IconRenderer name={cat?.icon || 'DollarSign'} size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[#390F1E]">{cat?.name || 'Transaction'}</p>
                          {tx.isReconciliation && (
                            <span className="text-[9px] font-bold text-[#6D1B3E] bg-[#F8E9E4] px-1.5 py-0.2 rounded-full">
                              Bank Reconciliation
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <span className="font-medium text-[#6D1B3E]">{wal?.name}</span>
                          <span>·</span>
                          <span>{formatDateIndo(tx.date)}</span>
                        </div>
                        {tx.notes && (
                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 italic">
                            "{tx.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span
                          className={`text-xs font-bold font-mono tabular-nums block ${
                            tx.type === 'income' ? 'text-emerald-700' : 'text-[#390F1E]'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatIDR(tx.amount)}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (window.confirm('Delete this transaction? Wallet balance will be adjusted accordingly.')) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        className="w-8 h-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors opacity-70 group-hover:opacity-100"
                        title="Delete Transaction"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AUTO RECURRING */}
      {subTab === 'recurring' && (
        <div className="space-y-3">
          {recurring.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#F3AEC5] space-y-2">
              <p className="text-xs text-slate-500">No recurring auto-debit transactions scheduled yet.</p>
              <button
                onClick={() => onOpenRecurringModal && onOpenRecurringModal()}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#CB497C] rounded-xl hover:bg-[#A93361]"
              >
                + Create Recurring Schedule
              </button>
            </div>
          ) : (
            recurring.map(rec => {
              const isProcessed = processedId === rec.id;
              const wal = walletMap.get(rec.walletId);
              const cat = catMap.get(rec.categoryId);

              return (
                <div
                  key={rec.id}
                  className="p-4 bg-white rounded-2xl border border-[#F8E9E4] shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#F8E9E4] text-[#6D1B3E] font-extrabold flex items-center justify-center shrink-0 text-xs">
                      Day {rec.dayOfMonth}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#390F1E]">{rec.title}</h4>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            rec.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {rec.active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {wal?.name} · {cat?.name}
                      </p>
                      {rec.lastProcessedDate && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Last processed: {rec.lastProcessedDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-[#CB497C] font-mono tabular-nums block">
                        -{formatIDR(rec.amount)}
                      </span>
                    </div>

                    {/* Manual execute now */}
                    <button
                      onClick={() => handleProcess(rec.id)}
                      disabled={isProcessed}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        isProcessed
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-[#FAF4F2] text-[#6D1B3E] hover:bg-[#F8E9E4]'
                      }`}
                      title="Process this transaction now"
                    >
                      {isProcessed ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Processed</span>
                        </>
                      ) : (
                        <>
                          <Play size={12} />
                          <span>Run Now</span>
                        </>
                      )}
                    </button>

                    {/* Active toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rec.active}
                        onChange={() => toggleRecurring(rec.id)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#CB497C]"></div>
                    </label>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete recurring schedule "${rec.title}"?`)) {
                          deleteRecurring(rec.id);
                        }
                      }}
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
