import React from 'react';
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { SavingsGoal } from '../types/finance';
import { formatIDR } from '../utils/formatters';
import { IconRenderer } from './IconRenderer';

interface GoalsAndRecurringViewProps {
  onOpenSavingsGoalModal: (goal?: SavingsGoal) => void;
  onOpenDepositModal: (goal: SavingsGoal) => void;
}

export const GoalsAndRecurringView: React.FC<GoalsAndRecurringViewProps> = ({
  onOpenSavingsGoalModal,
  onOpenDepositModal,
}) => {
  const { savingsGoals, deleteSavingsGoal } = useFinance();

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#390F1E] font-serif-brand">
            wi$h li$t
          </h1>
          <p className="text-xs text-[#A93361]">
            Track your dream purchases, savings targets, and wi$h li$t items
          </p>
        </div>

        <button
          onClick={() => onOpenSavingsGoalModal()}
          className="px-3.5 py-2 rounded-xl bg-[#CB497C] hover:bg-[#A93361] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus size={16} />
          <span>+ New wi$h li$t</span>
        </button>
      </div>

      {/* wi$h li$t Cards Grid */}
      <div className="space-y-3">
        {savingsGoals.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#F3AEC5] space-y-2">
            <p className="text-xs text-slate-500">No wi$h li$t items created yet.</p>
            <button
              onClick={() => onOpenSavingsGoalModal()}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#CB497C] rounded-xl hover:bg-[#A93361]"
            >
              + Add First wi$h li$t
            </button>
          </div>
        ) : (
          savingsGoals.map(goal => {
            const progress = Math.min(
              100,
              Math.round((goal.currentAmount / goal.targetAmount) * 100)
            );
            const isAchieved = goal.currentAmount >= goal.targetAmount;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal.id}
                className="p-4 bg-white rounded-2xl border border-[#F8E9E4] shadow-xs space-y-3 hover:border-[#F3AEC5]/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: goal.color || '#CB497C' }}
                    >
                      <IconRenderer name={goal.icon || 'Target'} size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#390F1E]">{goal.title}</h4>
                        {isAchieved && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            <span>Achieved</span>
                          </span>
                        )}
                      </div>
                      {goal.targetDate && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Target date: {goal.targetDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenSavingsGoalModal(goal)}
                      className="w-8 h-8 rounded-lg text-slate-400 hover:text-[#6D1B3E] hover:bg-[#FAF4F2] flex items-center justify-center transition-colors"
                      title="Edit wi$h li$t"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete wi$h li$t "${goal.title}"?`)) {
                          deleteSavingsGoal(goal.id);
                        }
                      }}
                      className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                      title="Delete wi$h li$t"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Numbers */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-extrabold text-[#390F1E] font-mono">
                      {formatIDR(goal.currentAmount)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      target {formatIDR(goal.targetAmount)}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-[#FAF4F2] rounded-full overflow-hidden p-0.5 border border-[#F8E9E4]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: goal.color || '#CB497C',
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-[#CB497C]">{progress}% collected</span>
                    <span className="text-slate-500 font-medium">
                      {isAchieved ? '🎉 Goal Achieved!' : `Remaining: ${formatIDR(remaining)}`}
                    </span>
                  </div>
                </div>

                {/* Deposit action button */}
                {!isAchieved && (
                  <button
                    onClick={() => onOpenDepositModal(goal)}
                    className="w-full py-2 px-3 rounded-xl bg-[#FAF4F2] hover:bg-[#F8E9E4] text-[#6D1B3E] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <TrendingUp size={14} className="text-[#CB497C]" />
                    <span>Deposit into wi$h li$t</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
