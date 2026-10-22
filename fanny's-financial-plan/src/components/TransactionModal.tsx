import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { TransactionType } from '../types/finance';
import { getTodayString, PALETTE, PALETTE_LIST } from '../utils/formatters';
import { IconRenderer } from './IconRenderer';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

const AVAILABLE_ICONS = [
  'Utensils', 'ShoppingBag', 'Car', 'Zap', 'Home', 'Sparkles',
  'HeartPulse', 'Coffee', 'Briefcase', 'Laptop', 'TrendingUp', 'Gift', 'Coins', 'BookOpen'
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
}) => {
  const { wallets, categories, addTransaction, addCategory, isUnlocked } = useFinance();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amountStr, setAmountStr] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');

  // New Category State
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('ShoppingBag');
  const [newCatColor, setNewCatColor] = useState(PALETTE.berryRose);

  if (!isOpen) return null;

  const filteredCategories = categories.filter(c => c.type === type);

  // Auto-select first category if current not in filtered list
  const activeCategoryId = categoryId || filteredCategories[0]?.id || '';

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmountStr(raw);
  };

  const addQuickAmount = (val: number) => {
    const current = parseInt(amountStr || '0', 10);
    setAmountStr(String(current + val));
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      type,
      icon: newCatIcon,
      color: newCatColor,
    });
    setNewCatName('');
    setShowAddCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountStr, 10);
    if (!amount || amount <= 0 || !walletId) return;

    addTransaction({
      type,
      amount,
      walletId,
      categoryId: activeCategoryId,
      date,
      notes: notes.trim(),
    });

    onClose();
    setAmountStr('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 transition-opacity">
      <div className="w-full max-w-lg bg-[#FAF4F2] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#F3AEC5]/40 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 bg-white/80 border-b border-[#F8E9E4] flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#A93361] font-semibold">Record Transaction</span>
            <h2 className="text-xl font-bold text-[#390F1E] font-serif-brand">
              {type === 'expense' ? 'New Expense' : 'New Income'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF4F2] hover:bg-[#F8E9E4] text-[#6D1B3E] flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Segmented Type Picker */}
          <div className="grid grid-cols-2 p-1 bg-[#F8E9E4] rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryId('');
              }}
              className={`py-2.5 text-sm font-semibold rounded-xl transition-all ${
                type === 'expense'
                  ? 'bg-[#CB497C] text-white shadow-sm'
                  : 'text-[#6D1B3E] hover:text-[#390F1E]'
              }`}
            >
              💸 Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryId('');
              }}
              className={`py-2.5 text-sm font-semibold rounded-xl transition-all ${
                type === 'income'
                  ? 'bg-[#6D1B3E] text-white shadow-sm'
                  : 'text-[#6D1B3E] hover:text-[#390F1E]'
              }`}
            >
              💰 Income
            </button>
          </div>

          {/* Amount Input */}
          <div className="bg-white p-4 rounded-2xl border border-[#F3AEC5]/50 shadow-xs">
            <label className="text-xs font-semibold text-[#A93361] uppercase tracking-wider">
              Transaction Amount (IDR)
            </label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-[#6D1B3E]">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amountStr ? parseInt(amountStr, 10).toLocaleString('en-US') : ''}
                onChange={handleAmountChange}
                autoFocus
                className="w-full text-3xl font-extrabold text-[#390F1E] bg-transparent outline-none tabular-nums placeholder:text-[#F3AEC5]"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#F8E9E4]">
              {[25000, 50000, 100000, 250000, 500000, 1000000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addQuickAmount(val)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#FAF4F2] hover:bg-[#F8E9E4] text-[#6D1B3E] border border-[#F3AEC5]/40 transition-colors"
                >
                  +{val >= 1000000 ? `${val / 1000000} M` : `${val / 1000} K`}
                </button>
              ))}
              {amountStr && (
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Choose Wallet */}
          <div>
            <label className="text-xs font-semibold text-[#6D1B3E] block mb-2">
              {type === 'expense' ? 'Pay With Wallet' : 'Deposit To Wallet / Account'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {wallets.map(w => {
                const isSelected = walletId === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWalletId(w.id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between min-h-[72px] ${
                      isSelected
                        ? 'border-[#CB497C] bg-white ring-2 ring-[#CB497C]/30 shadow-xs'
                        : 'border-[#F8E9E4] bg-white/70 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: w.color }}
                      >
                        <IconRenderer name={w.icon} size={14} />
                      </div>
                      {isSelected && <Check size={16} className="text-[#CB497C]" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#390F1E] truncate mt-1">{w.name}</p>
                      <p className="text-[10px] text-[#A93361] font-mono tabular-nums">
                        {isUnlocked ? `Rp ${w.balance.toLocaleString('en-US')}` : '••••••••'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#6D1B3E]">Category</label>
              <button
                type="button"
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="text-xs text-[#CB497C] font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Add Category
              </button>
            </div>

            {/* Inline Custom Category Creator */}
            {showAddCategory && (
              <div className="p-3 mb-3 bg-white rounded-2xl border border-[#CB497C]/40 space-y-3">
                <p className="text-xs font-bold text-[#390F1E]">New {type === 'expense' ? 'Expense' : 'Income'} Category</p>
                <input
                  type="text"
                  placeholder="e.g. Skincare, Fuel, Charity"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#F3AEC5] outline-none focus:border-[#CB497C]"
                />
                
                {/* Icon selection */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Select Icon:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_ICONS.map(ic => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setNewCatIcon(ic)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          newCatIcon === ic ? 'bg-[#CB497C] text-white' : 'bg-[#FAF4F2] text-[#6D1B3E]'
                        }`}
                      >
                        <IconRenderer name={ic} size={14} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color selection */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Select Color:</span>
                  <div className="flex gap-2">
                    {PALETTE_LIST.map(p => (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => setNewCatColor(p.hex)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          newCatColor === p.hex ? 'scale-110 border-[#390F1E]' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: p.hex }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-3 py-1.5 text-xs bg-[#CB497C] text-white font-semibold rounded-lg hover:bg-[#A93361]"
                  >
                    Save Category
                  </button>
                </div>
              </div>
            )}

            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {filteredCategories.map(cat => {
                const isSelected = activeCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-[#CB497C] bg-white ring-2 ring-[#CB497C]/20 shadow-xs'
                        : 'border-[#F8E9E4] bg-white/70 hover:bg-white'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      <IconRenderer name={cat.icon} size={15} />
                    </div>
                    <span className="text-xs font-semibold text-[#390F1E] truncate">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#F3AEC5]/50 bg-white text-[#390F1E] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Office lunch, artisan coffee..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#F3AEC5]/50 bg-white text-[#390F1E] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-white/90 border-t border-[#F8E9E4] pb-safe">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!amountStr || parseInt(amountStr, 10) <= 0}
            className="w-full h-12 rounded-2xl bg-[#CB497C] hover:bg-[#A93361] disabled:opacity-40 disabled:hover:bg-[#CB497C] text-white font-bold text-sm flex items-center justify-center shadow-md shadow-[#CB497C]/20 transition-all active:scale-[0.99]"
          >
            Save Transaction
          </button>
        </div>
      </div>
    </div>
  );
};
