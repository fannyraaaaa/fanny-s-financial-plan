import React, { useState } from 'react';
import {
  Target,
  RefreshCw,
  Plus,
  Calendar,
  Sparkles,
  Play,
  CheckCircle2,
  Trash2,
  Edit2,
  Clock,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { SavingsGoal, RecurringTransaction } from '../types/finance';
import { formatIDR, formatDateIndo } from '../utils/formatters';
import { IconRenderer } from './IconRenderer';

interface GoalsAndRecurringViewProps {
  onOpenSavingsGoalModal: (goal?: SavingsGoal) => void;
  onOpenDepositModal: (goal: SavingsGoal) => void;
  onOpenRecurringModal: (item?: RecurringTransaction) => void;
}

export const GoalsAndRecurringView: React.FC<GoalsAndRecurringViewProps> = ({
  onOpenSavingsGoalModal,
  onOpenDepositModal,
  onOpenRecurringModal,
}) => {
  const {
    savingsGoals,
    deleteSavingsGoal,
    recurring,
    deleteRecurring,
    toggleRecurring,
    processRecurringItem,
    wallets,
    categories,
  } = useFinance();

  const [activeSubTab, setActiveSubTab] = useState<'goals' | 'recurring'>('goals');
  const [processedId, setProcessedId] = useState<string | null>(null);

  const walletMap = new Map(wallets.map(w => [w.id, w.name]));
  const catMap = new Map(categories.map(c => [c.id, c.name]));

  const handleProcess = (id: string) => {
    const success = processRecurringItem(id);
    if (success) {
      setProcessedId(id);
      setTimeout(() => setProcessedId(null), 2500);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#390F1E] font-serif-brand">
            {activeSubTab === 'goals' ? 'wishli$t' : 'Recurring Transactions (Auto-Debit)'}
          </h1>
        </div>

        <button
          onClick={() => {
            if (activeSubTab === 'goals') onOpenSavingsGoalModal();
            else onOpenRecurringModal();
          }}
          className="px-3.5 py-2 rounded-xl bg-[#CB497C] hover:bg-[#A93361] text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
        >
          <Plus size={16} />
          <span>{activeSubTab === 'goals' ? '+ New wishli$t' : 'New Schedule'}</span>
        </button>
      </div>

      {/* Segmented Switch */}
      <div className="grid grid-cols-2 p-1 bg-[#F8E9E4] rounded-2xl">
        <button
          onClick={() => setActiveSubTab('goals')}
          className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'goals'
              ? 'bg-white text-[#CB497C] shadow-xs'
              : 'text-[#6D1B3E] hover:text-[#390F1E]'
          }`}
        >
          <Target size={15} />
          <span>wishli$t ({savingsGoals.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('recurring')}
          className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'recurring'
              ? 'bg-white text-[#6D1B3E] shadow-xs'
              : 'text-[#6D1B3E] hover:text-[#390F1E]'
          }`}
        >
          <RefreshCw size={15} />
          <span>Auto-Debit ({recurring.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: SAVINGS GOALS (wishli$t) */}
      {activeSubTab === 'goals' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {savingsGoals.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-dashed border-[#F3AEC5] space-y-2">
              <p className="text-xs text-slate-500">No wishli$t items created yet.</p>
              <button
                onClick={() => onOpenSavingsGoalModal()}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#CB497C] rounded-xl hover:bg-[#A93361]"
              >
                + Add First wishli$t
              </button>
            </div>
          ) : (
            savingsGoals.map(goal => {
              const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              const isAchieved = progress >= 100;

              return (
                <div
                  key={goal.id}
                  className="p-5 bg-white rounded-3xl border border-[#F8E9E4] shadow-xs space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: goal.color }}
                      >
                        <IconRenderer name={goal.icon} size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#390F1E] line-clamp-1">{goal.title}</h3>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock size={12} /> Target: {formatDateIndo(goal.targetDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenSavingsGoalModal(goal)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-[#CB497C] flex items-center justify-center"
                        title="Edit wishli$t"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete wishli$t "${goal.title}"?`)) {
                            deleteSavingsGoal(goal.id);
                          }
                        }}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-500 flex items-center justify-center"
                        title="Delete wishli$t"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar & Numbers */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-extrabold text-[#390F1E] font-mono tabular-nums text-sm">
                        {formatIDR(goal.currentAmount)}
                      </span>
                      <span className="text-slate-500 font-mono">
                        Target: {formatIDR(goal.targetAmount)}
                      </span>
                    </div>

                    <div className="w-full bg-[#FAF4F2] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, backgroundColor: goal.color }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-[#A93361] font-medium pt-0.5">
                      <span>Progress: {progress}%</span>
                      <span>{isAchieved ? '🎉 wishli$t Achieved!' : `Remaining: ${formatIDR(remaining)}`}</span>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-1">
                    <button
                      onClick={() => onOpenDepositModal(goal)}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#FAF4F2] hover:bg-[#F8E9E4] text-[#CB497C] border border-[#F3AEC5]/40 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sparkles size={14} />
                      <span>Deposit into wishli$t</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SUB-TAB 2: RECURRING TRANSACTIONS */}
      {activeSubTab === 'recurring' && (
        <div className="space-y-3">
          {recurring.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#F3AEC5] space-y-2">
              <p className="text-xs text-slate-500">No recurring auto-debit transactions scheduled yet.</p>
              <button
                onClick={() => onOpenRecurringModal()}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#CB497C] rounded-xl hover:bg-[#A93361]"
              >
                + Create Recurring Schedule
              </button>
            </div>
          ) : (
            recurring.map(rec => {
              const isProcessed = processedId === rec.id;
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
                        {walletMap.get(rec.walletId)} · {catMap.get(rec.categoryId)}
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
