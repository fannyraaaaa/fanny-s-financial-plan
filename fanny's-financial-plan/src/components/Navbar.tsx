import React from 'react';
import { Download, Lock, Unlock, Cloud, RefreshCw } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { exportFinancialSpreadsheet } from '../utils/spreadsheetExport';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenDailyInterest?: () => void;
  onOpenPasswordModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenPasswordModal,
}) => {
  const {
    wallets,
    transactions,
    categories,
    recurring,
    savingsGoals,
    reconciliationLogs,
    isUnlocked,
    lockVault,
    syncStatus,
    syncNow,
  } = useFinance();

  const handleExport = () => {
    exportFinancialSpreadsheet({
      wallets,
      transactions,
      categories,
      recurring,
      savingsGoals,
      reconciliationLogs,
    });
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF4F2]/90 backdrop-blur-md border-b border-[#F3AEC5]/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="text-lg sm:text-xl font-bold tracking-tight text-[#390F1E] font-serif-brand whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          fanny's financial plan
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-[#6D1B3E]">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'dashboard' ? 'text-[#CB497C] font-bold' : 'hover:text-[#390F1E]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('transactions')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'transactions' ? 'text-[#CB497C] font-bold' : 'hover:text-[#390F1E]'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => onSelectTab('wallets')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'wallets' ? 'text-[#CB497C] font-bold' : 'hover:text-[#390F1E]'
            }`}
          >
            Wallets & Accounts
          </button>
          <button
            onClick={() => onSelectTab('goals')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'goals' ? 'text-[#CB497C] font-bold' : 'hover:text-[#390F1E]'
            }`}
          >
            wi$h li$t
          </button>
          <button
            onClick={() => onSelectTab('spreadsheet')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'spreadsheet' ? 'text-[#CB497C] font-bold' : 'hover:text-[#390F1E]'
            }`}
          >
            Spreadsheet
          </button>
        </nav>

        {/* Zone 3: Cloud Sync, Vault Security Lock Toggle & Export */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Cloud Sync Status */}
          {syncStatus === 'syncing' ? (
            <span
              className="px-2.5 py-1 text-[11px] font-semibold text-[#CB497C] bg-[#F8E9E4] rounded-xl border border-[#F3AEC5]/50 flex items-center gap-1.5"
              title="Sedang menyinkronkan data ke cloud..."
            >
              <RefreshCw size={12} className="animate-spin text-[#CB497C]" />
              <span className="hidden sm:inline">Syncing...</span>
            </span>
          ) : syncStatus === 'error' ? (
            <button
              onClick={() => syncNow()}
              className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 flex items-center gap-1.5 transition-colors"
              title="Gagal sinkron. Klik untuk mencoba lagi."
            >
              <RefreshCw size={12} className="text-amber-600" />
              <span>Retry Sync</span>
            </button>
          ) : (
            <button
              onClick={() => syncNow()}
              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 rounded-xl border border-emerald-200/60 flex items-center gap-1.5 transition-colors"
              title="Tersinkronisasi antar perangkat secara real-time. Klik untuk sinkronkan ulang."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <Cloud size={13} className="text-emerald-600" />
              <span className="hidden sm:inline">Cloud Synced</span>
            </button>
          )}

          {/* Padlock button at the very top */}
          {isUnlocked ? (
            <button
              onClick={lockVault}
              className="px-3 py-1.5 text-xs font-bold text-[#6D1B3E] bg-[#F8E9E4] hover:bg-[#F3AEC5]/40 rounded-xl transition-all flex items-center gap-1.5 border border-[#F3AEC5]/40"
              title="Click to lock"
            >
              <Unlock size={14} className="text-emerald-600" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          ) : (
            <button
              onClick={onOpenPasswordModal}
              className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#6D1B3E] to-[#CB497C] hover:opacity-95 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              title="Click to enter password"
            >
              <Lock size={14} />
              <span>Unlock</span>
            </button>
          )}

          <button
            onClick={handleExport}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#CB497C] hover:bg-[#A93361] rounded-xl transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-[0.98]"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
