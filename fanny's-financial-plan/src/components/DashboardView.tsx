import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRightLeft,
  Scale,
  Eye,
  EyeOff,
  ChevronRight,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatIDR, formatDateIndo, getTodayString } from '../utils/formatters';
import { IconRenderer } from './IconRenderer';

interface DashboardViewProps {
  onOpenTransaction: (type: 'expense' | 'income') => void;
  onOpenTransfer: () => void;
  onOpenReconciliation: (walletId?: string) => void;
  onOpenWalletModal: () => void;
  onOpenDepositGoal: (goalId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenTransaction,
  onOpenTransfer,
  onOpenReconciliation,
  onOpenWalletModal,
  onOpenDepositGoal,
  onNavigateTab,
}) => {
  const {
    wallets,
    transactions,
    savingsGoals,
    recurring,
    categories,
    totalNetWorth,
    monthlyIncome,
    monthlyExpense,
  } = useFinance();

  const [showBalance, setShowBalance] = useState(true);

  const catMap = new Map(categories.map(c => [c.id, c]));
  const walletMap = new Map(wallets.map(w => [w.id, w]));
  const today = getTodayString();

  return (
    <div className="space-y-5 pb-20">
      {/* 1. HERO BALANCE CARD */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#6D1B3E] via-[#A93361] to-[#CB497C] text-white shadow-xl shadow-[#6D1B3E]/15 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#390F1E]/20 blur-lg pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-medium tracking-wider text-[#F8E9E4]/80">
                Total Net Worth
              </span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-[#F8E9E4]/80 hover:text-white transition-colors"
                title={showBalance ? 'Hide Balance' : 'Show Balance'}
              >
                {showBalance ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            </div>
            <span className="text-[11px] text-[#F8E9E4]/90 bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-xs font-mono">
              {formatDateIndo(today)}
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif-brand tabular-nums">
              {showBalance ? formatIDR(totalNetWorth) : '••••••••••••'}
            </h1>
            <p className="text-xs text-[#F8E9E4]/80 mt-1">
              {wallets.length > 0
                ? `From ${wallets.length} active wallets & accounts`
                : 'Start by adding your first wallet or account'}
            </p>
          </div>

          {/* Monthly Cashflow Strip */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/15">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/25 flex items-center justify-center text-emerald-200">
                <ArrowDownRight size={15} />
              </div>
              <div>
                <span className="text-[10px] text-[#F8E9E4]/70 block">Monthly Income</span>
                <span className="text-xs font-bold font-mono tabular-nums">
                  {showBalance ? `+${formatIDR(monthlyIncome)}` : '••••••••'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-[#F8E9E4]">
                <ArrowUpRight size={15} />
              </div>
              <div>
                <span className="text-[10px] text-[#F8E9E4]/70 block">Monthly Expense</span>
                <span className="text-xs font-bold font-mono tabular-nums">
                  {showBalance ? `-${formatIDR(monthlyExpense)}` : '••••••••'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MONTH-END RECONCILIATION BANNER */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#F3AEC5]/50 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#6D1B3E] text-white flex items-center justify-center shrink-0">
            <Scale size={18} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#390F1E]">Month-End Balance Reconciliation</h3>
          </div>
        </div>

        <button
          onClick={() => onOpenReconciliation()}
          className="px-3.5 py-2 text-xs font-bold text-white bg-[#CB497C] hover:bg-[#A93361] rounded-xl transition-all shadow-xs shrink-0"
        >
          Reconcile
        </button>
      </div>

      {/* 3. QUICK ACTION BUTTONS */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onOpenTransaction('expense')}
          className="p-3 rounded-2xl bg-white border border-[#F8E9E4] shadow-2xs hover:border-[#CB497C] transition-all flex flex-col items-center gap-1 text-center group active:scale-[0.97]"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FAF4F2] group-hover:bg-[#CB497C] group-hover:text-white text-[#CB497C] flex items-center justify-center transition-colors">
            <ArrowUpRight size={18} />
          </div>
          <span className="text-[11px] font-bold text-[#390F1E] mt-0.5">Expense</span>
        </button>

        <button
          onClick={() => onOpenTransaction('income')}
          className="p-3 rounded-2xl bg-white border border-[#F8E9E4] shadow-2xs hover:border-[#6D1B3E] transition-all flex flex-col items-center gap-1 text-center group active:scale-[0.97]"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FAF4F2] group-hover:bg-[#6D1B3E] group-hover:text-white text-[#6D1B3E] flex items-center justify-center transition-colors">
            <ArrowDownRight size={18} />
          </div>
          <span className="text-[11px] font-bold text-[#390F1E] mt-0.5">Income</span>
        </button>

        <button
          onClick={onOpenTransfer}
          className="p-3 rounded-2xl bg-white border border-[#F8E9E4] shadow-2xs hover:border-[#A93361] transition-all flex flex-col items-center gap-1 text-center group active:scale-[0.97]"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FAF4F2] group-hover:bg-[#A93361] group-hover:text-white text-[#A93361] flex items-center justify-center transition-colors">
            <ArrowRightLeft size={18} />
          </div>
          <span className="text-[11px] font-bold text-[#390F1E] mt-0.5">Transfer</span>
        </button>

        <button
          onClick={() => onOpenReconciliation()}
          className="p-3 rounded-2xl bg-white border border-[#F8E9E4] shadow-2xs hover:border-[#6D1B3E] transition-all flex flex-col items-center gap-1 text-center group active:scale-[0.97]"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FAF4F2] group-hover:bg-[#6D1B3E] group-hover:text-white text-[#6D1B3E] flex items-center justify-center transition-colors">
            <Scale size={18} />
          </div>
          <span className="text-[11px] font-bold text-[#390F1E] mt-0.5">Reconcile</span>
        </button>
      </div>

      {/* 4. WALLET CAROUSEL / GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#390F1E] font-serif-brand">Wallets & Accounts</h2>
            <p className="text-[11px] text-[#A93361]">All bank accounts, e-wallets & cash</p>
          </div>
          <button
            onClick={() => onNavigateTab('wallets')}
            className="text-xs font-bold text-[#CB497C] hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {wallets.map(w => (
            <div
              key={w.id}
              className="min-w-[210px] sm:min-w-[240px] p-4 rounded-2xl text-white shadow-sm flex flex-col justify-between shrink-0 snap-start relative overflow-hidden transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: w.color }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider opacity-85 block">
                    {w.typeLabel}
                  </span>
                  <h3 className="text-sm font-bold truncate max-w-[140px] mt-0.5">{w.name}</h3>
                </div>
                <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                  <IconRenderer name={w.icon} size={15} />
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-white/20">
                <span className="text-[10px] opacity-75 block">Balance</span>
                <p className="text-base font-extrabold font-mono tabular-nums">
                  {showBalance ? formatIDR(w.balance) : '••••••••'}
                </p>
              </div>
            </div>
          ))}

          {/* Quick Add Wallet Button */}
          <button
            onClick={onOpenWalletModal}
            className="min-w-[140px] p-4 rounded-2xl border-2 border-dashed border-[#F3AEC5] bg-white/50 hover:bg-white text-[#A93361] flex flex-col items-center justify-center gap-2 shrink-0 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-[#FAF4F2] flex items-center justify-center text-[#CB497C]">
              <Plus size={18} />
            </div>
            <span className="text-xs font-bold text-center">Add Wallet</span>
          </button>
        </div>
      </div>

      {/* 5. wishli$t HIGHLIGHT */}
      {savingsGoals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#390F1E] font-serif-brand">wishli$t</h2>
              <p className="text-[11px] text-[#A93361]">Dreams & goals you are saving for</p>
            </div>
            <button
              onClick={() => onNavigateTab('goals')}
              className="text-xs font-bold text-[#CB497C] hover:underline flex items-center gap-0.5"
            >
              <span>All wishli$ts</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savingsGoals.slice(0, 2).map(goal => {
              const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div
                  key={goal.id}
                  className="p-4 bg-white rounded-2xl border border-[#F8E9E4] shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl text-white flex items-center justify-center"
                        style={{ backgroundColor: goal.color }}
                      >
                        <IconRenderer name={goal.icon} size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#390F1E] truncate max-w-[140px]">
                          {goal.title}
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          Target: {formatIDR(goal.targetAmount)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-[#CB497C]">{progress}%</span>
                  </div>

                  <div className="w-full bg-[#FAF4F2] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, backgroundColor: goal.color }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-600 font-mono tabular-nums">
                      {formatIDR(goal.currentAmount)}
                    </span>
                    <button
                      onClick={() => onOpenDepositGoal(goal.id)}
                      className="text-xs font-bold text-[#CB497C] bg-[#FAF4F2] hover:bg-[#F8E9E4] px-2.5 py-1 rounded-lg transition-colors"
                    >
                      + Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. RECENT TRANSACTIONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#390F1E] font-serif-brand">Recent Transactions</h2>
            <p className="text-[11px] text-[#A93361]">Latest income and expense records</p>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-bold text-[#CB497C] hover:underline flex items-center gap-0.5"
          >
            <span>All Transactions</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#F8E9E4] shadow-2xs divide-y divide-[#F8E9E4] overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No transactions recorded yet. Tap Expense or Income to get started.
            </div>
          ) : (
            transactions.slice(0, 5).map(tx => {
              const cat = catMap.get(tx.categoryId);
              const wal = walletMap.get(tx.walletId);
              return (
                <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-[#FAF4F2]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat?.color || '#A93361' }}
                    >
                      <IconRenderer name={cat?.icon || 'DollarSign'} size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#390F1E] line-clamp-1">
                        {cat?.name || 'Transaction'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        <span>{wal?.name || 'Wallet'}</span>
                        <span>·</span>
                        <span>{formatDateIndo(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-bold font-mono tabular-nums block ${
                        tx.type === 'income' ? 'text-emerald-700' : 'text-[#390F1E]'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatIDR(tx.amount)}
                    </span>
                    {tx.notes && (
                      <span className="text-[10px] text-slate-400 max-w-[120px] truncate block">
                        {tx.notes}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
