import React from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRightLeft,
  Scale,
  ChevronRight,
  CheckCircle2,
  Lock,
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
    categories,
    totalNetWorth,
    monthlyIncome,
    monthlyExpense,
    isUnlocked,
    openPasswordModal,
  } = useFinance();

  const catMap = new Map(categories.map(c => [c.id, c]));
  const walletMap = new Map(wallets.map(w => [w.id, w]));
  const today = getTodayString();

  return (
    <div className="space-y-5 pb-20">
      {/* 1. HERO BALANCE CARD (TAP TO UNLOCK) */}
      <div
        onClick={!isUnlocked ? openPasswordModal : undefined}
        className={`p-6 rounded-3xl bg-gradient-to-br from-[#6D1B3E] via-[#A93361] to-[#CB497C] text-white shadow-xl shadow-[#6D1B3E]/15 relative overflow-hidden transition-all ${
          !isUnlocked ? 'cursor-pointer hover:shadow-2xl active:scale-[0.99] group' : ''
        }`}
        title={!isUnlocked ? 'Tap to unlock' : undefined}
      >
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#390F1E]/20 blur-lg pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-medium tracking-wider text-[#F8E9E4]/80">
                Total Net Worth
              </span>
              {!isUnlocked && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPasswordModal();
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="Click to unlock"
                >
                  <Lock size={10} />
                  <span>Locked</span>
                </button>
              )}
            </div>
            <span className="text-[11px] text-[#F8E9E4]/90 bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-xs font-mono">
              {formatDateIndo(today)}
            </span>
          </div>

          <div>
            {isUnlocked ? (
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif-brand tabular-nums">
                {formatIDR(totalNetWorth)}
              </h1>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-widest font-mono text-white/90">
                  Rp ••••••••••
                </span>
              </div>
            )}
            {isUnlocked && (
              <p className="text-xs text-[#F8E9E4]/90 mt-1">
                From {wallets.length} active wallets & accounts
              </p>
            )}
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
                  {isUnlocked ? `+${formatIDR(monthlyIncome)}` : '••••••••'}
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
                  {isUnlocked ? `-${formatIDR(monthlyExpense)}` : '••••••••'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTION BUTTONS (NO PASSWORD REQUIRED) */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onOpenTransaction('expense')}
          className="p-3 rounded-2xl bg-white border border-[#F8E9E4] shadow-2xs hover:border-[#CB497C] hover:shadow-xs transition-all flex flex-col items-center gap-1.5 group text-center"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <TrendingDownIcon size={18} />
          </div>
          <span className="text-xs font-bold text-[#390F1E]">Expense</span>
        </button>

        <button
          onClick={() => onOpenTransaction('income')}
          className="p-3 rounded-2xl bg-white border border-[#F8E9E4] shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all flex flex-col items-center gap-1.5 group text-center"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <TrendingUp size={18} />
          </div>
          <span className="text-xs font-bold text-[#390F1E]">Income</span>
        </button>

        <button
          onClick={() => {
            if (!isUnlocked) {
              openPasswordModal();
              return;
            }
            onOpenTransfer();
          }}
          className="p-3 rounded-2xl bg-white border border-[#F8E9E4] shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all flex flex-col items-center gap-1.5 group text-center"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ArrowRightLeft size={18} />
          </div>
          <span className="text-xs font-bold text-[#390F1E]">Transfer</span>
        </button>

        <button
          onClick={() => {
            if (!isUnlocked) {
              openPasswordModal();
              return;
            }
            onOpenReconciliation();
          }}
          className="p-3 rounded-2xl bg-white border border-[#F8E9E4] shadow-2xs hover:border-[#CB497C] hover:shadow-xs transition-all flex flex-col items-center gap-1.5 group text-center"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Scale size={18} />
          </div>
          <span className="text-xs font-bold text-[#390F1E]">Reconcile</span>
        </button>
      </div>

      {/* 3. WALLETS & ACCOUNTS OVERVIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#390F1E] font-serif-brand">Wallets & Accounts</h2>
            <p className="text-[11px] text-[#A93361]">Balances and payment methods</p>
          </div>
          <button
            onClick={() => {
              if (isUnlocked) {
                onNavigateTab('wallets');
              } else {
                openPasswordModal();
              }
            }}
            className="text-xs font-bold text-[#CB497C] hover:underline flex items-center gap-0.5"
          >
            <span>Manage All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {wallets.map(w => (
            <div
              key={w.id}
              onClick={() => {
                if (isUnlocked) {
                  onNavigateTab('wallets');
                } else {
                  openPasswordModal();
                }
              }}
              className="p-3.5 bg-white rounded-2xl border border-[#F8E9E4] shadow-2xs space-y-2 hover:border-[#F3AEC5]/70 transition-all cursor-pointer active:scale-[0.98]"
              title={!isUnlocked ? "Tap to unlock" : w.name}
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs"
                  style={{ backgroundColor: w.color }}
                >
                  <IconRenderer name={w.icon} size={15} />
                </div>
                {w.accountNumber && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    ••••{w.accountNumber.slice(-4)}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#390F1E] truncate block">
                  {w.name}
                </span>
                <span className="text-xs font-extrabold text-[#6D1B3E] font-mono tabular-nums block mt-0.5">
                  {isUnlocked ? formatIDR(w.balance) : '••••••••'}
                </span>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              if (!isUnlocked) {
                openPasswordModal();
                return;
              }
              onOpenWalletModal();
            }}
            className="p-3.5 rounded-2xl border border-dashed border-[#F3AEC5] bg-white/50 hover:bg-white text-[#CB497C] flex flex-col items-center justify-center gap-1.5 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-[#FAF4F2] flex items-center justify-center text-[#CB497C]">
              <Plus size={16} />
            </div>
            <span className="text-xs font-bold text-center">Add Wallet</span>
          </button>
        </div>
      </div>

      {/* 4. wi$h li$t HIGHLIGHT */}
      {savingsGoals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#390F1E] font-serif-brand">wi$h li$t</h2>
              <p className="text-[11px] text-[#A93361]">Dreams & goals you are saving for</p>
            </div>
            <button
              onClick={() => onNavigateTab('goals')}
              className="text-xs font-bold text-[#CB497C] hover:underline flex items-center gap-0.5"
            >
              <span>All wi$h li$ts</span>
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
                          Target: {isUnlocked ? formatIDR(goal.targetAmount) : '••••••••'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-[#CB497C]">{isUnlocked ? `${progress}%` : '••%'}</span>
                  </div>

                  <div className="w-full bg-[#FAF4F2] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: isUnlocked ? `${progress}%` : '0%', backgroundColor: goal.color }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-600 font-mono tabular-nums">
                      {isUnlocked ? formatIDR(goal.currentAmount) : '••••••••'}
                    </span>
                    <button
                      onClick={() => {
                        if (!isUnlocked) {
                          openPasswordModal();
                          return;
                        }
                        onOpenDepositGoal(goal.id);
                      }}
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

      {/* 5. RECENT TRANSACTIONS (PASSWORD PROTECTED) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#390F1E] font-serif-brand">Recent Transactions</h2>
            <p className="text-[11px] text-[#A93361]">Latest income and expense records</p>
          </div>
          {isUnlocked && (
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-bold text-[#CB497C] hover:underline flex items-center gap-0.5"
            >
              <span>All Transactions</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {!isUnlocked ? (
          <div
            onClick={openPasswordModal}
            className="p-6 bg-white rounded-2xl border border-[#F8E9E4] hover:border-[#CB497C] shadow-2xs text-center space-y-3 cursor-pointer transition-all active:scale-[0.99] group"
            title="Tap to unlock"
          >
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FAF4F2] group-hover:bg-[#F8E9E4] text-[#CB497C] flex items-center justify-center transition-colors shadow-2xs">
              <Lock size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#390F1E]">Transaction Records Protected</h4>
              <p className="text-[11px] text-[#A93361] max-w-xs mx-auto mt-0.5 font-medium">
                Dilindungi dengan password
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openPasswordModal();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D1B3E] to-[#CB497C] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm group-hover:opacity-95 transition-all"
            >
              <Lock size={13} />
              <span>Unlock</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#F8E9E4] shadow-2xs divide-y divide-[#F8E9E4] overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No transactions recorded yet. Tap Expense or Income to get started.
              </div>
            ) : (
              transactions.slice(0, 5).map(tx => {
                const isTransfer =
                  tx.isTransfer ||
                  tx.id?.startsWith('tx-tr-') ||
                  tx.notes?.startsWith('Transfer to ') ||
                  tx.notes?.startsWith('Transfer from ');
                const cat = isTransfer ? null : catMap.get(tx.categoryId || '');
                const wal = walletMap.get(tx.walletId);
                return (
                  <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-[#FAF4F2]/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: isTransfer ? '#6D1B3E' : (cat?.color || '#A93361') }}
                      >
                        {isTransfer ? (
                          <ArrowRightLeft size={18} />
                        ) : (
                          <IconRenderer name={cat?.icon || 'DollarSign'} size={18} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#390F1E] line-clamp-1">
                          {isTransfer ? (tx.notes || 'Transfer Antar Wallet') : (cat?.name || 'Transaction')}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <span>{wal?.name || 'Wallet'}</span>
                          <span>·</span>
                          <span>{formatDateIndo(tx.date)}</span>
                          {isTransfer && (
                            <>
                              <span>·</span>
                              <span className="text-[9px] font-bold text-[#6D1B3E] bg-[#FAF4F2] border border-[#F3AEC5]/50 px-1.5 py-0.2 rounded-full">
                                Transfer
                              </span>
                            </>
                          )}
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
                      {!isTransfer && tx.notes && (
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
        )}
      </div>
    </div>
  );
};

// Simple helper icon for expense
function TrendingDownIcon(props: { size?: number }) {
  return (
    <svg
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
