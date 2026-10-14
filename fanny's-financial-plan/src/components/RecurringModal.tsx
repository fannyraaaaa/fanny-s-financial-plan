import React, { useState, useEffect } from 'react';
import { X, Calendar, RefreshCw } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { RecurringTransaction, TransactionType } from '../types/finance';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: RecurringTransaction | null;
}

export const RecurringModal: React.FC<RecurringModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
}) => {
  const { wallets, categories, addRecurring, editRecurring } = useFinance();

  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [notes, setNotes] = useState('');

  const filteredCategories = categories.filter(c => c.type === type);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setAmountStr(String(itemToEdit.amount));
      setType(itemToEdit.type);
      setWalletId(itemToEdit.walletId);
      setCategoryId(itemToEdit.categoryId);
      setDayOfMonth(itemToEdit.dayOfMonth);
      setNotes(itemToEdit.notes || '');
    } else {
      setTitle('');
      setAmountStr('');
      setType('expense');
      setWalletId(wallets[0]?.id || '');
      setCategoryId(filteredCategories[0]?.id || '');
      setDayOfMonth(1);
      setNotes('');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmountStr(raw);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountStr || '0', 10);
    if (!title.trim() || amount <= 0 || !walletId) return;

    const chosenCat = categoryId || filteredCategories[0]?.id || '';

    if (itemToEdit) {
      editRecurring(itemToEdit.id, {
        title: title.trim(),
        amount,
        type,
        walletId,
        categoryId: chosenCat,
        dayOfMonth,
        notes: notes.trim(),
      });
    } else {
      addRecurring({
        title: title.trim(),
        amount,
        type,
        walletId,
        categoryId: chosenCat,
        dayOfMonth,
        active: true,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#FAF4F2] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#F3AEC5]/40 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 bg-white/80 border-b border-[#F8E9E4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#CB497C] text-white flex items-center justify-center">
              <RefreshCw size={16} />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-[#A93361] font-semibold">
                Auto Schedule
              </span>
              <h2 className="text-xl font-bold text-[#390F1E] font-serif-brand">
                {itemToEdit ? 'Edit Recurring Schedule' : 'New Recurring Schedule'}
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
        <div className="overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">
              Recurring Transaction Title
            </label>
            <input
              type="text"
              placeholder="e.g. Apartment Rent, Internet & WiFi, Netflix, Gym..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-[#F3AEC5]/60 bg-white text-[#390F1E] outline-none"
            />
          </div>

          {/* Amount */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#F3AEC5]/50 shadow-xs">
            <label className="text-[11px] font-bold text-[#A93361] uppercase tracking-wider block">
              Recurring Amount (IDR)
            </label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-bold text-[#6D1B3E]">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amountStr ? parseInt(amountStr, 10).toLocaleString('en-US') : ''}
                onChange={handleAmountChange}
                className="w-full text-2xl font-extrabold text-[#390F1E] bg-transparent outline-none tabular-nums"
              />
            </div>
          </div>

          {/* Day of Month Selector */}
          <div>
            <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">
              Auto Schedule: Every Month on Day
            </label>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#F8E9E4] text-[#6D1B3E] flex items-center justify-center font-bold">
                <Calendar size={18} />
              </div>
              <select
                value={dayOfMonth}
                onChange={e => setDayOfMonth(parseInt(e.target.value, 10))}
                className="flex-1 text-sm font-bold px-3 py-2.5 rounded-xl border border-[#F3AEC5]/60 bg-white text-[#390F1E] outline-none"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    Day {day} of every month
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Wallet & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">
                Source Wallet
              </label>
              <select
                value={walletId}
                onChange={e => setWalletId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#F3AEC5]/60 bg-white text-[#390F1E] outline-none"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">
                Category
              </label>
              <select
                value={categoryId || filteredCategories[0]?.id || ''}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#F3AEC5]/60 bg-white text-[#390F1E] outline-none"
              >
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">Additional Notes</label>
            <input
              type="text"
              placeholder="e.g. Account subscription number, contract..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#F3AEC5]/60 bg-white text-[#390F1E] outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/90 border-t border-[#F8E9E4] pb-safe">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || !amountStr || parseInt(amountStr, 10) <= 0}
            className="w-full h-12 rounded-2xl bg-[#CB497C] hover:bg-[#A93361] disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-[#CB497C]/20 transition-all active:scale-[0.99]"
          >
            {itemToEdit ? 'Save Changes' : 'Schedule Recurring Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
};
