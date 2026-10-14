import React from 'react';
import { Download, Sparkles, FileSpreadsheet } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { exportFinancialSpreadsheet } from '../utils/spreadsheetExport';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenDailyInterest?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenDailyInterest,
}) => {
  const {
    wallets,
    transactions,
    categories,
    recurring,
    savingsGoals,
    reconciliationLogs,
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark in single text element */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="text-lg sm:text-xl font-bold tracking-tight text-[#390F1E] font-serif-brand whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          fanny's financial plan
        </button>

        {/* Zone 2: 4–5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#6D1B3E]">
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
            wishli$t & Auto
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

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
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
