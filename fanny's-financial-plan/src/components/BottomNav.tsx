import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Target,
  FileSpreadsheet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  Scale,
  X,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenTransaction: (type: 'expense' | 'income') => void;
  onOpenTransfer: () => void;
  onOpenReconciliation: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenTransaction,
  onOpenTransfer,
  onOpenReconciliation,
}) => {
  const [showQuickSheet, setShowQuickSheet] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'wallets', label: 'Wallets', icon: Wallet },
    { id: 'goals', label: 'wi$h li$t', icon: Target },
    { id: 'spreadsheet', label: 'Spreadsheet', icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Quick Action Overlay Sheet */}
      {showQuickSheet && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex items-end justify-center animate-in fade-in"
          onClick={() => setShowQuickSheet(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-24 shadow-2xl space-y-4 border-t border-[#F3AEC5] animate-in slide-in-from-bottom"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#390F1E] font-serif-brand">
                Quick Financial Actions
              </h3>
              <button
                onClick={() => setShowQuickSheet(false)}
                className="w-7 h-7 rounded-full bg-[#FAF4F2] text-[#6D1B3E] flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  onOpenTransaction('expense');
                }}
                className="p-3.5 rounded-2xl bg-[#FAF4F2] hover:bg-[#F8E9E4] text-left border border-[#F8E9E4] transition-all flex items-center gap-3 active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#CB497C] text-white flex items-center justify-center shrink-0">
                  <ArrowUpRight size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#390F1E]">Expense</h4>
                  <p className="text-[10px] text-[#A93361]">Record spending</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  onOpenTransaction('income');
                }}
                className="p-3.5 rounded-2xl bg-[#FAF4F2] hover:bg-[#F8E9E4] text-left border border-[#F8E9E4] transition-all flex items-center gap-3 active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#6D1B3E] text-white flex items-center justify-center shrink-0">
                  <ArrowDownRight size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#390F1E]">Income</h4>
                  <p className="text-[10px] text-[#A93361]">Salary / freelance</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  onOpenTransfer();
                }}
                className="p-3.5 rounded-2xl bg-[#FAF4F2] hover:bg-[#F8E9E4] text-left border border-[#F8E9E4] transition-all flex items-center gap-3 active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#A93361] text-white flex items-center justify-center shrink-0">
                  <ArrowRightLeft size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#390F1E]">Transfer</h4>
                  <p className="text-[10px] text-[#A93361]">Between wallets</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  onOpenReconciliation();
                }}
                className="p-3.5 rounded-2xl bg-[#FAF4F2] hover:bg-[#F8E9E4] text-left border border-[#F8E9E4] transition-all flex items-center gap-3 active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#6D1B3E] text-white flex items-center justify-center shrink-0">
                  <Scale size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#390F1E]">Reconciliation</h4>
                  <p className="text-[10px] text-[#A93361]">Match bank balance</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#F3AEC5]/40 pb-safe md:hidden">
        <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto relative px-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? 'bg-[#CB497C] text-white scale-105 shadow-2xs' : 'text-[#6D1B3E] hover:text-[#390F1E]'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-[10px] mt-0.5 tracking-tight font-medium ${
                    isActive ? 'text-[#CB497C] font-bold' : 'text-[#6D1B3E]'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Center (+) Action Button on Mobile */}
      <button
        onClick={() => setShowQuickSheet(!showQuickSheet)}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-30 w-13 h-13 rounded-full bg-gradient-to-tr from-[#CB497C] to-[#A93361] text-white flex items-center justify-center shadow-lg shadow-[#CB497C]/30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="Tambah Transaksi Cepat"
      >
        <Plus size={24} className={`transition-transform duration-200 ${showQuickSheet ? 'rotate-45' : ''}`} />
      </button>
    </>
  );
};
