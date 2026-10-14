import React, { useState } from 'react';
import { X, CheckCircle2, TrendingUp, AlertCircle, Sparkles, Scale } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatIDR, getTodayString } from '../utils/formatters';

interface ReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWalletId?: string;
}

export const ReconciliationModal: React.FC<ReconciliationModalProps> = ({
  isOpen,
  onClose,
  initialWalletId,
}) => {
  const { wallets, reconcileWallet, reconciliationLogs } = useFinance();

  const [selectedWalletId, setSelectedWalletId] = useState(
    initialWalletId || wallets[0]?.id || ''
  );
  const [realBalanceStr, setRealBalanceStr] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentWallet = wallets.find(w => w.id === selectedWalletId);
  const appBalance = currentWallet?.balance || 0;
  const realBalance = realBalanceStr !== '' ? parseInt(realBalanceStr, 10) : appBalance;
  const difference = realBalance - appBalance;

  const handleRealBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9-]/g, '');
    setRealBalanceStr(raw);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWallet) return;

    const res = reconcileWallet(
      currentWallet.id,
      realBalance,
      customReason.trim() || undefined,
      date
    );

    if (res) {
      if (res.difference > 0) {
        setSuccessMessage(`Reconciliation successful! Difference of ${formatIDR(res.difference)} recorded as Bank Interest into ${currentWallet.name}.`);
      } else if (res.difference < 0) {
        setSuccessMessage(`Reconciliation successful! Difference of ${formatIDR(Math.abs(res.difference))} recorded as Bank Fee / Tax from ${currentWallet.name}.`);
      } else {
        setSuccessMessage(`Balance of ${currentWallet.name} matches your m-banking statement perfectly!`);
      }

      setRealBalanceStr('');
      setCustomReason('');
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#FAF4F2] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#F3AEC5]/40 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 bg-white/80 border-b border-[#F8E9E4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#6D1B3E] text-white flex items-center justify-center">
              <Scale size={16} />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#A93361] font-semibold">
                Month-End Balance Adjustment
              </span>
              <h2 className="text-xl font-bold text-[#390F1E] font-serif-brand">
                Bank Reconciliation
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
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Notification */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {wallets.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-[#F3AEC5] space-y-3">
              <p className="text-xs text-[#6D1B3E]">
                No wallets or accounts registered yet. Please add a wallet first before reconciling.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#CB497C] text-white hover:bg-[#A93361] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Wallet Selector Tabs */}
              <div>
                <label className="text-xs font-semibold text-[#6D1B3E] block mb-2">
                  Select Wallet / Account:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {wallets.map(w => {
                    const isSelected = selectedWalletId === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setSelectedWalletId(w.id);
                          setRealBalanceStr('');
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#CB497C] text-white border-[#CB497C] shadow-xs'
                            : 'bg-white text-[#6D1B3E] border-[#F8E9E4] hover:bg-[#F8E9E4]'
                        }`}
                      >
                        <span>{w.name}</span>
                        <span className="font-mono text-[10px] opacity-80">({formatIDR(w.balance)})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {currentWallet && (
                <div className="space-y-4">
                  {/* Current App Balance */}
                  <div className="p-4 bg-white rounded-2xl border border-[#F8E9E4] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#A93361] tracking-wider block">
                        Balance Recorded in App
                      </span>
                      <span className="text-xl font-extrabold text-[#390F1E] font-mono tabular-nums">
                        {formatIDR(appBalance)}
                      </span>
                    </div>
                    {currentWallet.lastReconciledDate && (
                      <span className="text-[10px] text-slate-500 bg-[#FAF4F2] px-2 py-1 rounded-lg">
                        Last matched: {currentWallet.lastReconciledDate}
                      </span>
                    )}
                  </div>

                  {/* Input Real Balance from M-Banking */}
                  <div className="p-4 bg-white rounded-2xl border border-[#F3AEC5] shadow-xs space-y-2">
                    <label className="text-xs font-bold text-[#6D1B3E] block">
                      Actual Statement Balance from M-Banking (IDR)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-[#6D1B3E]">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={appBalance.toLocaleString('en-US')}
                        value={realBalanceStr !== '' ? parseInt(realBalanceStr, 10).toLocaleString('en-US') : ''}
                        onChange={handleRealBalanceChange}
                        className="w-full text-2xl font-extrabold text-[#390F1E] bg-transparent outline-none tabular-nums placeholder:text-[#F3AEC5]"
                      />
                    </div>
                  </div>

                  {/* Difference Preview Card */}
                  <div className="p-4 rounded-2xl bg-[#F8E9E4] border border-[#F3AEC5]/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#6D1B3E]">Balance Difference:</span>
                      <span
                        className={`text-base font-extrabold font-mono tabular-nums ${
                          difference > 0
                            ? 'text-emerald-700'
                            : difference < 0
                            ? 'text-[#CB497C]'
                            : 'text-slate-600'
                        }`}
                      >
                        {difference > 0 ? `+${formatIDR(difference)}` : difference < 0 ? `-${formatIDR(Math.abs(difference))}` : 'Rp 0 (Exact match)'}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#390F1E] leading-relaxed pt-1 border-t border-[#F3AEC5]/40">
                      {difference > 0 ? (
                        <p className="text-emerald-800">
                          ✨ M-banking balance is higher by <strong>{formatIDR(difference)}</strong>. This difference is recorded as <strong>Bank Interest</strong> (Income).
                        </p>
                      ) : difference < 0 ? (
                        <p className="text-rose-800">
                          ℹ️ M-banking balance is lower by <strong>{formatIDR(Math.abs(difference))}</strong>. This difference is recorded as <strong>Bank Fees / Tax</strong> (Expense).
                        </p>
                      ) : (
                        <p className="text-slate-600">
                          App balance matches your bank statement exactly!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Custom Note & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">
                        Transaction Reason / Note
                      </label>
                      <input
                        type="text"
                        placeholder={difference >= 0 ? 'Month-End Bank Interest' : 'Bank Fees & Tax'}
                        value={customReason}
                        onChange={e => setCustomReason(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#F3AEC5]/60 bg-white text-[#390F1E] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">
                        Reconciliation Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#F3AEC5]/60 bg-white text-[#390F1E] outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full h-12 rounded-2xl bg-[#CB497C] hover:bg-[#A93361] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#CB497C]/20 transition-all active:scale-[0.99]"
                    >
                      <Sparkles size={16} />
                      <span>Adjust & Save Reconciliation</span>
                    </button>
                  </div>
                </div>
              )}

              {/* History of Reconciliations */}
              {reconciliationLogs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#F8E9E4]">
                  <h4 className="text-xs font-bold text-[#390F1E]">Month-End Reconciliation Logs</h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {reconciliationLogs.map(log => (
                      <div
                        key={log.id}
                        className="p-2.5 bg-white rounded-xl border border-[#F8E9E4] flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#390F1E]">{log.walletName} · {log.date}</p>
                          <p className="text-[10px] text-slate-500">{log.reason}</p>
                        </div>
                        <span
                          className={`font-bold font-mono tabular-nums ${
                            log.difference >= 0 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {log.difference >= 0 ? `+${formatIDR(log.difference)}` : `-${formatIDR(Math.abs(log.difference))}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
