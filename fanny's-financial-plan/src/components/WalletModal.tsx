import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Wallet, WalletType } from '../types/finance';
import { PALETTE, PALETTE_LIST } from '../utils/formatters';
import { IconRenderer } from './IconRenderer';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletToEdit?: Wallet | null;
}

const WALLET_TYPES: { type: WalletType; label: string; icon: string }[] = [
  { type: 'debit', label: 'Debit Card / Bank Account', icon: 'CreditCard' },
  { type: 'cash', label: 'Physical Cash', icon: 'Banknote' },
  { type: 'ewallet', label: 'E-Wallet (GoPay/Shopee/OVO)', icon: 'Smartphone' },
  { type: 'credit', label: 'Credit Card', icon: 'CreditCard' },
  { type: 'savings', label: 'Dedicated Savings', icon: 'ShieldCheck' },
  { type: 'custom', label: 'Other Custom Wallet', icon: 'Wallet' },
];

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  walletToEdit,
}) => {
  const { addWallet, editWallet, isUnlocked } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('debit');
  const [customTypeLabel, setCustomTypeLabel] = useState('');
  const [balanceStr, setBalanceStr] = useState('0');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState(PALETTE.berryRose);
  const [icon, setIcon] = useState('CreditCard');

  useEffect(() => {
    if (walletToEdit) {
      setName(walletToEdit.name);
      setType(walletToEdit.type);
      setCustomTypeLabel(walletToEdit.typeLabel);
      setBalanceStr(isUnlocked ? String(walletToEdit.balance) : '••••••••');
      setAccountNumber(walletToEdit.accountNumber || '');
      setColor(walletToEdit.color);
      setIcon(walletToEdit.icon);
    } else {
      setName('');
      setType('debit');
      setCustomTypeLabel('Debit Card');
      setBalanceStr('0');
      setAccountNumber('');
      setColor(PALETTE.berryRose);
      setIcon('CreditCard');
    }
  }, [walletToEdit, isOpen]);

  if (!isOpen) return null;

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9-]/g, '');
    setBalanceStr(raw);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const balance = (walletToEdit && !isUnlocked) ? walletToEdit.balance : parseInt(balanceStr || '0', 10);
    const chosenTypeObj = WALLET_TYPES.find(t => t.type === type);
    const typeLabel = type === 'custom' && customTypeLabel.trim() ? customTypeLabel.trim() : (chosenTypeObj?.label || 'Wallet');

    if (walletToEdit) {
      editWallet(walletToEdit.id, {
        name: name.trim(),
        type,
        typeLabel,
        balance,
        accountNumber: accountNumber.trim(),
        color,
        icon,
      });
    } else {
      addWallet({
        name: name.trim(),
        type,
        typeLabel,
        balance,
        accountNumber: accountNumber.trim(),
        color,
        icon,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#FAF4F2] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#F3AEC5]/40 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 bg-white/80 border-b border-[#F8E9E4] flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#A93361] font-semibold">
              {walletToEdit ? 'Edit Wallet' : 'Add Wallet / Account'}
            </span>
            <h2 className="text-xl font-bold text-[#390F1E] font-serif-brand">
              {walletToEdit ? walletToEdit.name : 'New Wallet'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF4F2] hover:bg-[#F8E9E4] text-[#6D1B3E] flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Wallet Name */}
          <div>
            <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">
              Wallet / Account Name
            </label>
            <input
              type="text"
              placeholder="e.g. Chase Checking, Apple Pay, Cash in Drawer..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-[#F3AEC5]/60 bg-white text-[#390F1E] outline-none focus:border-[#CB497C]"
            />
          </div>

          {/* Type Selector */}
          <div>
            <label className="text-xs font-semibold text-[#6D1B3E] block mb-2">
              Wallet Category / Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WALLET_TYPES.map(item => {
                const isSelected = type === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setType(item.type);
                      setIcon(item.icon);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-[#CB497C] bg-white ring-2 ring-[#CB497C]/20 shadow-xs'
                        : 'border-[#F8E9E4] bg-white/60 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#CB497C] text-white' : 'bg-[#FAF4F2] text-[#6D1B3E]'
                      }`}
                    >
                      <IconRenderer name={item.icon} size={15} />
                    </div>
                    <span className="text-xs font-medium text-[#390F1E] truncate">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {type === 'custom' && (
              <input
                type="text"
                placeholder="Type your custom category name..."
                value={customTypeLabel}
                onChange={e => setCustomTypeLabel(e.target.value)}
                className="w-full text-xs mt-2 px-3 py-2 rounded-xl border border-[#F3AEC5] bg-white text-[#390F1E] outline-none"
              />
            )}
          </div>

          {/* Balance & Account Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">
                Current Balance (IDR)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={balanceStr}
                disabled={Boolean(walletToEdit && !isUnlocked)}
                onChange={handleBalanceChange}
                className="w-full text-sm font-semibold px-3 py-2.5 rounded-xl border border-[#F3AEC5]/60 bg-white text-[#390F1E] outline-none font-mono tabular-nums disabled:bg-[#FAF4F2] disabled:text-slate-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6D1B3E] block mb-1">
                Card / Account Number (Optional)
              </label>
              <input
                type="text"
                placeholder="•••• 4321 / 0812-..."
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#F3AEC5]/60 bg-white text-[#390F1E] outline-none"
              />
            </div>
          </div>

          {/* Color Palette Picker */}
          <div>
            <label className="text-xs font-semibold text-[#6D1B3E] block mb-2">
              Card / Wallet Color
            </label>
            <div className="flex items-center gap-2">
              {PALETTE_LIST.map(p => (
                <button
                  key={p.hex}
                  type="button"
                  onClick={() => setColor(p.hex)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    color === p.hex ? 'scale-110 border-[#390F1E] shadow-sm' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: p.hex }}
                  title={p.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/90 border-t border-[#F8E9E4] pb-safe">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full h-12 rounded-2xl bg-[#CB497C] hover:bg-[#A93361] disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-[#CB497C]/20 transition-all active:scale-[0.99]"
          >
            {walletToEdit ? 'Save Changes' : 'Add Wallet'}
          </button>
        </div>
      </div>
    </div>
  );
};
