import React, { useState, useEffect } from 'react';
import { X, Target, Plane, ShieldCheck, Laptop, HeartPulse, Sparkles, Home, Car, Gift } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { SavingsGoal } from '../types/finance';
import { PALETTE, PALETTE_LIST } from '../utils/formatters';
import { IconRenderer } from './IconRenderer';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
}

const GOAL_ICONS = ['Plane', 'ShieldCheck', 'Laptop', 'Home', 'Car', 'Sparkles', 'Gift', 'HeartPulse'];

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { addSavingsGoal, editSavingsGoal } = useFinance();

  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [initialSavedStr, setInitialSavedStr] = useState('0');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [color, setColor] = useState(PALETTE.berryRose);
  const [icon, setIcon] = useState('Plane');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setTargetAmountStr(String(goalToEdit.targetAmount));
      setInitialSavedStr(String(goalToEdit.currentAmount));
      setTargetDate(goalToEdit.targetDate);
      setColor(goalToEdit.color);
      setIcon(goalToEdit.icon);
      setNotes(goalToEdit.notes || '');
    } else {
      setTitle('');
      setTargetAmountStr('');
      setInitialSavedStr('0');
      setTargetDate('2026-12-31');
      setColor(PALETTE.berryRose);
      setIcon('Plane');
      setNotes('');
    }
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setTargetAmountStr(raw);
  };

  const handleInitialSavedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setInitialSavedStr(raw);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseInt(targetAmountStr || '0', 10);
    const currentAmount = parseInt(initialSavedStr || '0', 10);
    if (!title.trim() || targetAmount <= 0) return;

    if (goalToEdit) {
      editSavingsGoal(goalToEdit.id, {
        title: title.trim(),
        targetAmount,
        currentAmount,
        targetDate,
        color,
        icon,
        notes: notes.trim(),
      });
    } else {
      addSavingsGoal({
        title: title.trim(),
        targetAmount,
        currentAmount,
        targetDate,
        color,
        icon,
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
            <div className="w-8 h-8 rounded-xl bg-[#6D1B3E] text-white flex items-center justify-center">
              <Target size={16} />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-[#A93361] font-semibold">
                wi$h li$t
              </span>
              <h2 className="text-xl font-bold text-[#390F1E] font-serif-brand">
                {goalToEdit ? 'Edit wi$h li$t' : 'New wi$h li$t Goal'}
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
              Item Name / wi$h li$t Goal
            </label>
            <input
              type="text"
              placeholder="e.g. Vacation in Bali, New MacBook, Dream Handbag..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-[#F3AEC5]/60 bg-white text-[#390F1E] outline-none"
            />
          </div>

          {/* Target Amount */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#F3AEC5]/50 shadow-xs">
            <label className="text-[11px] font-bold text-[#A93361] uppercase tracking-wider block">
              Target Budget (IDR)
            </label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-bold text-[#6D1B3E]">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={targetAmountStr ? parseInt(targetAmountStr, 10).toLocaleString('en-US') : ''}
                onChange={handleTargetChange}
                className="w-full text-2xl font-extrabold text-[#390F1E] bg-transparent outline-none tabular-nums"
              />
            </div>
          </div>

          {/* Current Saved & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">
                Currently Saved Amount
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={initialSavedStr ? parseInt(initialSavedStr, 10).toLocaleString('en-US') : ''}
                onChange={handleInitialSavedChange}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#F3AEC5]/60 bg-white text-[#390F1E] outline-none font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">
                Target Deadline Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#F3AEC5]/60 bg-white text-[#390F1E] outline-none"
              />
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="text-xs font-semibold text-[#6D1B3E] block mb-1.5">Select Icon</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    icon === ic ? 'bg-[#CB497C] text-white shadow-xs' : 'bg-white text-[#6D1B3E] border border-[#F8E9E4]'
                  }`}
                >
                  <IconRenderer name={ic} size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="text-xs font-semibold text-[#6D1B3E] block mb-1.5">Accent Color</label>
            <div className="flex items-center gap-2">
              {PALETTE_LIST.map(p => (
                <button
                  key={p.hex}
                  type="button"
                  onClick={() => setColor(p.hex)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === p.hex ? 'scale-110 border-[#390F1E]' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: p.hex }}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">Notes</label>
            <input
              type="text"
              placeholder="e.g. Save Rp 1M each month from salary..."
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
            disabled={!title.trim() || !targetAmountStr || parseInt(targetAmountStr, 10) <= 0}
            className="w-full h-12 rounded-2xl bg-[#CB497C] hover:bg-[#A93361] disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-[#CB497C]/20 transition-all active:scale-[0.99]"
          >
            {goalToEdit ? 'Save wi$h li$t' : 'Add to wi$h li$t'}
          </button>
        </div>
      </div>
    </div>
  );
};
