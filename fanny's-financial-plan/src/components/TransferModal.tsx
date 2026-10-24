import React, { useState } from 'react';
import { X, ArrowRightLeft, ArrowRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { getTodayString } from '../utils/formatters';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const { wallets, transferWallet, isUnlocked } = useFinance();

  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || '');
  const [amountStr, setAmountStr] = useState('');
  const [adminFeeStr, setAdminFeeStr] = useState('0');
  const [date, setDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const fromWallet = wallets.find(w => w.id === fromWalletId);
  const toWallet = wallets.find(w => w.id === toWalletId);

  const amount = parseInt(amountStr || '0', 10);
  const adminFee = parseInt(adminFeeStr || '0', 10);
  const totalDeduction = amount + adminFee;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmountStr(raw);
  };

  const handleSwap = () => {
    const temp = fromWalletId;
    setFromWalletId(toWalletId);
    setToWalletId(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0 || !fromWalletId || !toWalletId || fromWalletId === toWalletId) return;

    transferWallet({
      fromWalletId,
      toWalletId,
      amount,
      adminFee,
      date,
      notes: notes.trim(),
    });

    onClose();
    setAmountStr('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#FAF4F2] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#F3AEC5]/40 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 bg-white/80 border-b border-[#F8E9E4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#6D1B3E] text-white flex items-center justify-center">
              <ArrowRightLeft size={16} />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-[#A93361] font-semibold">Move Funds</span>
              <h2 className="text-xl font-bold text-[#390F1E] font-serif-brand">Wallet Transfer</h2>
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
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Source & Destination Lockup */}
          <div className="p-4 bg-white rounded-2xl border border-[#F3AEC5]/50 shadow-xs relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* From Wallet */}
              <div>
                <label className="text-[11px] font-bold text-[#A93361] uppercase tracking-wider block mb-1">
                  From Wallet
                </label>
                <select
                  value={fromWalletId}
                  onChange={e => setFromWalletId(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#F8E9E4] bg-[#FAF4F2] text-[#390F1E] outline-none"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id} disabled={w.id === toWalletId}>
                      {w.name} {isUnlocked ? `(Rp ${w.balance.toLocaleString('en-US')})` : ''}
                    </option>
                  ))}
                </select>
                {fromWallet && (
                  <p className="text-[10px] text-[#A93361] mt-1 tabular-nums font-mono">
                    Remaining: {isUnlocked ? `Rp ${fromWallet.balance.toLocaleString('en-US')}` : '••••••••'}
                  </p>
                )}
              </div>

              {/* To Wallet */}
              <div>
                <label className="text-[11px] font-bold text-[#A93361] uppercase tracking-wider block mb-1">
                  To Wallet
                </label>
                <select
                  value={toWalletId}
                  onChange={e => setToWalletId(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#F8E9E4] bg-[#FAF4F2] text-[#390F1E] outline-none"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id} disabled={w.id === fromWalletId}>
                      {w.name} {isUnlocked ? `(Rp ${w.balance.toLocaleString('en-US')})` : ''}
                    </option>
                  ))}
                </select>
                {toWallet && (
                  <p className="text-[10px] text-[#A93361] mt-1 tabular-nums font-mono">
                    Current balance: {isUnlocked ? `Rp ${toWallet.balance.toLocaleString('en-US')}` : '••••••••'}
                  </p>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center my-2">
              <button
                type="button"
                onClick={handleSwap}
                className="px-3 py-1 text-[11px] font-medium rounded-full bg-[#FAF4F2] hover:bg-[#F8E9E4] text-[#6D1B3E] border border-[#F3AEC5] flex items-center gap-1.5 transition-colors"
              >
                <ArrowRightLeft size={12} /> Swap Transfer Direction
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-white p-4 rounded-2xl border border-[#F3AEC5]/50 shadow-xs">
            <label className="text-xs font-semibold text-[#A93361] uppercase tracking-wider">
              Transfer Amount (IDR)
            </label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-[#6D1B3E]">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amountStr ? parseInt(amountStr, 10).toLocaleString('en-US') : ''}
                onChange={handleAmountChange}
                className="w-full text-2xl font-extrabold text-[#390F1E] bg-transparent outline-none tabular-nums"
              />
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-[#F8E9E4]">
              {[50000, 100000, 500000, 1000000, 2500000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmountStr(String(val))}
                  className="px-2.5 py-0.5 text-xs rounded-lg bg-[#FAF4F2] text-[#6D1B3E] hover:bg-[#F8E9E4]"
                >
                  {val >= 1000000 ? `${val / 1000000} M` : `${val / 1000} K`}
                </button>
              ))}
            </div>
          </div>

          {/* Admin Fee Options */}
          <div>
            <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">
              Transfer Admin Fee
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Free (Rp 0)', fee: 0 },
                { label: 'BI-FAST (Rp 2,500)', fee: 2500 },
                { label: 'Realtime (Rp 6,500)', fee: 6500 },
              ].map(opt => (
                <button
                  key={opt.fee}
                  type="button"
                  onClick={() => setAdminFeeStr(String(opt.fee))}
                  className={`p-2 rounded-xl text-center border text-xs font-medium transition-all ${
                    adminFee === opt.fee
                      ? 'border-[#CB497C] bg-white font-bold text-[#CB497C] ring-1 ring-[#CB497C]'
                      : 'border-[#F8E9E4] bg-white/70 text-[#6D1B3E]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Preview Card */}
          {amount > 0 && fromWallet && toWallet && (
            <div className="p-3 bg-[#F8E9E4]/60 rounded-xl border border-[#F3AEC5]/40 text-xs space-y-1.5">
              <div className="flex justify-between text-[#6D1B3E]">
                <span>Total Deducted from {fromWallet.name}:</span>
                <span className="font-bold text-[#390F1E] tabular-nums">
                  {isUnlocked ? `Rp ${totalDeduction.toLocaleString('en-US')}` : '••••••••'}
                </span>
              </div>
              <div className="flex justify-between text-[#6D1B3E]">
                <span>Received in {toWallet.name}:</span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {isUnlocked ? `+Rp ${amount.toLocaleString('en-US')}` : '••••••••'}
                </span>
              </div>
            </div>
          )}

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#F3AEC5]/50 bg-white text-[#390F1E] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">Notes</label>
              <input
                type="text"
                placeholder="e.g. Top up e-wallet, credit card bill..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#F3AEC5]/50 bg-white text-[#390F1E] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/90 border-t border-[#F8E9E4] pb-safe">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!amount || amount <= 0 || fromWalletId === toWalletId}
            className="w-full h-12 rounded-2xl bg-[#6D1B3E] hover:bg-[#390F1E] disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#6D1B3E]/20 transition-all active:scale-[0.99]"
          >
            <span>Execute Transfer</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
