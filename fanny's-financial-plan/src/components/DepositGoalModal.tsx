import React, { useState } from 'react';
import { X, PiggyBank, Sparkles, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { SavingsGoal } from '../types/finance';
import { formatIDR } from '../utils/formatters';

interface DepositGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const DepositGoalModal: React.FC<DepositGoalModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { wallets, depositToGoal } = useFinance();

  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [amountStr, setAmountStr] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !goal) return null;

  const selectedWallet = wallets.find(w => w.id === walletId);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmountStr(raw);
    setErrorMsg('');
  };

  const handleQuickFill = (val: number) => {
    setAmountStr(String(val));
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountStr || '0', 10);
    if (!amount || amount <= 0) return;

    if (selectedWallet && selectedWallet.balance < amount) {
      setErrorMsg(`Insufficient balance in ${selectedWallet.name} (${formatIDR(selectedWallet.balance)})`);
      return;
    }

    const ok = depositToGoal(goal.id, walletId, amount);
    if (ok) {
      onClose();
      setAmountStr('');
      setErrorMsg('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#FAF4F2] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#F3AEC5]/40 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 bg-white/80 border-b border-[#F8E9E4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#CB497C] text-white flex items-center justify-center">
              <PiggyBank size={18} />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-[#A93361] font-semibold">
                Deposit to wishli$t
              </span>
              <h2 className="text-lg font-bold text-[#390F1E] font-serif-brand truncate max-w-[220px]">
                {goal.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF4F2] hover:bg-[#F8E9E4] text-[#6D1B3E] flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Target Progress Status */}
          <div className="p-3.5 bg-white rounded-2xl border border-[#F3AEC5]/40 space-y-2">
            <div className="flex justify-between text-xs text-[#6D1B3E]">
              <span>Saved: <strong>{formatIDR(goal.currentAmount)}</strong></span>
              <span>Target: <strong>{formatIDR(goal.targetAmount)}</strong></span>
            </div>
            <div className="w-full bg-[#F8E9E4] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#CB497C] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-[#A93361] text-right font-medium">
              Remaining needed: {formatIDR(remaining)}
            </p>
          </div>

          {/* Amount input */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#F3AEC5]/50 shadow-xs">
            <label className="text-[11px] font-bold text-[#A93361] uppercase tracking-wider block">
              Deposit Amount (IDR)
            </label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-bold text-[#6D1B3E]">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amountStr ? parseInt(amountStr, 10).toLocaleString('en-US') : ''}
                onChange={handleAmountChange}
                autoFocus
                className="w-full text-2xl font-extrabold text-[#390F1E] bg-transparent outline-none tabular-nums"
              />
            </div>

            {/* Quick buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-[#F8E9E4]">
              {[100000, 250000, 500000, 1000000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickFill(val)}
                  className="px-2.5 py-0.5 text-xs rounded-lg bg-[#FAF4F2] text-[#6D1B3E] hover:bg-[#F8E9E4]"
                >
                  +{val >= 1000000 ? `${val / 1000000} M` : `${val / 1000} K`}
                </button>
              ))}
              {remaining > 0 && (
                <button
                  type="button"
                  onClick={() => handleQuickFill(remaining)}
                  className="px-2.5 py-0.5 text-xs rounded-lg bg-[#F8E9E4] text-[#CB497C] font-semibold hover:bg-[#F3AEC5]"
                >
                  Fill Remaining Goal
                </button>
              )}
            </div>
          </div>

          {/* Source Wallet */}
          <div>
            <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">
              Deduct Funds From Wallet / Account
            </label>
            <select
              value={walletId}
              onChange={e => setWalletId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#F3AEC5]/60 bg-white text-[#390F1E] outline-none"
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({formatIDR(w.balance)})
                </option>
              ))}
            </select>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/90 border-t border-[#F8E9E4] pb-safe">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!amountStr || parseInt(amountStr, 10) <= 0}
            className="w-full h-12 rounded-2xl bg-[#CB497C] hover:bg-[#A93361] disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-[#CB497C]/20 transition-all active:scale-[0.99]"
          >
            <Sparkles size={16} />
            <span>Deposit Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
