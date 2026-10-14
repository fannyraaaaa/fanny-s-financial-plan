import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { TransactionType } from '../types/finance';
import { formatIDR, formatDateIndo } from '../utils/formatters';
import { IconRenderer } from './IconRenderer';

interface TransactionsViewProps {
  onOpenTransaction: (type: TransactionType) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onOpenTransaction }) => {
  const { transactions, categories, wallets, deleteTransaction } = useFinance();

  const [activeFilter, setActiveFilter] = useState<'all' | 'expense' | 'income' | 'reconciliation'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('all');

  const catMap = new Map(categories.map(c => [c.id, c]));
  const walletMap = new Map(wallets.map(w => [w.id, w]));

  const filteredTransactions = transactions.filter(tx => {
    // Type filter
    if (activeFilter === 'expense' && tx.type !== 'expense') return false;
    if (activeFilter === 'income' && tx.type !== 'income') return false;
    if (activeFilter === 'reconciliation' && !tx.isReconciliation) return false;

    // Wallet filter
    if (selectedWalletId !== 'all' && tx.walletId !== selectedWalletId) return false;

    // Search filter
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
      {/* Header & Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#390F1E] font-serif-brand">
            Transaction History
          </h1>
          <p className="text-xs text-[#A93361]">Total {transactions.length} recorded transactions</p>
        </div>
        <button
          onClick={() => onOpenTransaction('expense')}
          className="px-3.5 py-2 rounded-xl bg-[#CB497C] hover:bg-[#A93361] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus size={16} />
          <span>New Entry</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F8E9E4] rounded-2xl overflow-x-auto scrollbar-none">
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

      {/* Transactions List */}
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
  );
};
