import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Search,
  RotateCcw,
  ArrowDownToLine,
  Scale,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { exportFinancialSpreadsheet, exportTransactionsCSV } from '../utils/spreadsheetExport';
import { formatIDR, formatDateIndo } from '../utils/formatters';

type SheetTab = 'transactions' | 'wallets' | 'recurring' | 'goals' | 'reconciliation' | 'summary';

export const SpreadsheetView: React.FC = () => {
  const {
    wallets,
    transactions,
    categories,
    recurring,
    savingsGoals,
    reconciliationLogs,
    resetToDefault,
    totalNetWorth,
    monthlyIncome,
    monthlyExpense,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<SheetTab>('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const catMap = new Map(categories.map(c => [c.id, c.name]));
  const walletMap = new Map(wallets.map(w => [w.id, w.name]));

  // Handle Excel Export
  const handleExportExcel = () => {
    exportFinancialSpreadsheet({
      wallets,
      transactions,
      categories,
      recurring,
      savingsGoals,
      reconciliationLogs,
    });
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    exportTransactionsCSV(transactions, categories, wallets);
  };

  // Copy to clipboard for Google Sheets pasting
  const handleCopyForGoogleSheets = () => {
    let tsv = '';
    if (activeTab === 'transactions') {
      tsv = ['No\tDate\tType\tCategory\tWallet\tAmount\tNotes'].join('\n') + '\n';
      tsv += transactions
        .map(
          (t, i) =>
            `${i + 1}\t${t.date}\t${t.type === 'income' ? 'Income' : 'Expense'}\t${
              catMap.get(t.categoryId) || ''
            }\t${walletMap.get(t.walletId) || ''}\t${t.amount}\t${t.notes || ''}`
        )
        .join('\n');
    } else if (activeTab === 'wallets') {
      tsv = ['No\tWallet Name\tCategory\tBalance\tLast Reconciled'].join('\n') + '\n';
      tsv += wallets
        .map(
          (w, i) =>
            `${i + 1}\t${w.name}\t${w.typeLabel}\t${w.balance}\t${w.lastReconciledDate || '-'}`
        )
        .join('\n');
    } else {
      tsv = 'Fanny\'s Financial Plan Database Export';
    }

    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#6D1B3E] via-[#A93361] to-[#CB497C] text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F8E9E4] flex items-center gap-1.5">
              <FileSpreadsheet size={15} /> Spreadsheet
            </span>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-white text-[#6D1B3E] font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-[#F8E9E4] transition-all active:scale-[0.98]"
            >
              <ArrowDownToLine size={15} />
              <span>{downloadSuccess ? 'Saved!' : 'Download Excel (.xlsx)'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
            >
              <Download size={14} />
              <span>Template CSV</span>
            </button>
            <button
              onClick={handleCopyForGoogleSheets}
              className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy to Google Sheets'}</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('Reset database back to initial state?')) {
                  resetToDefault();
                }
              }}
              className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-red-500/30 text-white/80 hover:text-white text-xs transition-colors"
              title="Reset Database"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Sheet Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#F3AEC5]/50">
        {[
          { id: 'transactions', label: '💸 Transactions', count: transactions.length },
          { id: 'wallets', label: '💳 Wallets & Accounts', count: wallets.length },
          { id: 'recurring', label: '🔄 Auto-Debit', count: recurring.length },
          { id: 'goals', label: '🎯 wishli$t', count: savingsGoals.length },
          { id: 'reconciliation', label: '⚖️ Reconciliation', count: reconciliationLogs.length },
          { id: 'summary', label: '📊 Summary' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SheetTab)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-t border-x shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-white text-[#CB497C] border-[#F3AEC5] border-b-2 border-b-white shadow-xs font-bold'
                  : 'bg-[#F8E9E4]/60 text-[#6D1B3E] border-transparent hover:bg-white/70'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-[#F3AEC5] text-[#390F1E]' : 'bg-white/50 text-[#A93361]'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-[#F3AEC5]/40 shadow-xs">
        <div className="flex items-center gap-2 flex-1 px-2">
          <Search size={15} className="text-[#A93361]" />
          <input
            type="text"
            placeholder="Search data in this sheet..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-xs text-[#390F1E] outline-none placeholder:text-[#F3AEC5]"
          />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-[11px] text-[#A93361] hover:underline pr-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table Data View */}
      <div className="bg-white rounded-2xl border border-[#F3AEC5]/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {/* TAB 1: TRANSAKSI */}
          {activeTab === 'transactions' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF4F2] text-[#6D1B3E] border-b border-[#F3AEC5]/50 font-bold">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Wallet</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8E9E4]">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No transaction records in database.
                    </td>
                  </tr>
                ) : (
                  transactions
                    .filter(t => {
                      if (!searchTerm) return true;
                      const cat = catMap.get(t.categoryId) || '';
                      const wal = walletMap.get(t.walletId) || '';
                      return (
                        cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        wal.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (t.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.date.includes(searchTerm)
                      );
                    })
                    .map((t, idx) => (
                      <tr key={t.id} className="hover:bg-[#FAF4F2]/60 transition-colors">
                        <td className="py-2.5 px-3 text-center text-[11px] text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 text-[#390F1E] whitespace-nowrap font-medium">
                          {t.date}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.type === 'income'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {t.type === 'income' ? 'Income' : 'Expense'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#390F1E] font-medium whitespace-nowrap">
                          {catMap.get(t.categoryId) || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-[#6D1B3E] whitespace-nowrap">
                          {walletMap.get(t.walletId) || '-'}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold font-mono tabular-nums whitespace-nowrap ${
                            t.type === 'income' ? 'text-emerald-700' : 'text-[#390F1E]'
                          }`}
                        >
                          {t.type === 'income' ? '+' : '-'}
                          {formatIDR(t.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-[200px] truncate">
                          {t.notes || '-'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 2: DOMPET & REKENING */}
          {activeTab === 'wallets' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF4F2] text-[#6D1B3E] border-b border-[#F3AEC5]/50 font-bold">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3">Wallet / Account Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Current Balance</th>
                  <th className="py-2.5 px-3 text-center">Last Reconciled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8E9E4]">
                {wallets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No wallet or account records in database.
                    </td>
                  </tr>
                ) : (
                  wallets
                    .filter(w => !searchTerm || w.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((w, idx) => (
                      <tr key={w.id} className="hover:bg-[#FAF4F2]/60 transition-colors">
                        <td className="py-2.5 px-3 text-center text-[11px] text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#390F1E] whitespace-nowrap">
                          {w.name}
                        </td>
                        <td className="py-2.5 px-3 text-[#6D1B3E] whitespace-nowrap">
                          {w.typeLabel}
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-[#390F1E] font-mono tabular-nums whitespace-nowrap">
                          {formatIDR(w.balance)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 whitespace-nowrap font-mono text-[11px]">
                          {w.lastReconciledDate || 'Never'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 3: RECURRING */}
          {activeTab === 'recurring' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF4F2] text-[#6D1B3E] border-b border-[#F3AEC5]/50 font-bold">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3">Recurring Item</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Monthly Schedule</th>
                  <th className="py-2.5 px-3">Source Wallet</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8E9E4]">
                {recurring.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No recurring transactions in database.
                    </td>
                  </tr>
                ) : (
                  recurring
                    .filter(r => !searchTerm || r.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((r, idx) => (
                      <tr key={r.id} className="hover:bg-[#FAF4F2]/60 transition-colors">
                        <td className="py-2.5 px-3 text-center text-[11px] text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#390F1E] whitespace-nowrap">
                          {r.title}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#CB497C] font-mono tabular-nums whitespace-nowrap">
                          {formatIDR(r.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-[#6D1B3E] font-medium whitespace-nowrap">
                          Every Day {r.dayOfMonth}
                        </td>
                        <td className="py-2.5 px-3 text-[#390F1E] whitespace-nowrap">
                          {walletMap.get(r.walletId) || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-[#6D1B3E] whitespace-nowrap">
                          {catMap.get(r.categoryId) || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {r.active ? 'Active' : 'Paused'}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 4: wishli$t */}
          {activeTab === 'goals' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF4F2] text-[#6D1B3E] border-b border-[#F3AEC5]/50 font-bold">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3">wishli$t Title</th>
                  <th className="py-2.5 px-3 text-right">Target Amount</th>
                  <th className="py-2.5 px-3 text-right">Saved</th>
                  <th className="py-2.5 px-3 text-right">Remaining</th>
                  <th className="py-2.5 px-3 text-center">Progress %</th>
                  <th className="py-2.5 px-3">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8E9E4]">
                {savingsGoals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No wishli$t goals in database.
                    </td>
                  </tr>
                ) : (
                  savingsGoals
                    .filter(g => !searchTerm || g.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((g, idx) => {
                      const progress = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                      const remaining = Math.max(0, g.targetAmount - g.currentAmount);

                      return (
                        <tr key={g.id} className="hover:bg-[#FAF4F2]/60 transition-colors">
                          <td className="py-2.5 px-3 text-center text-[11px] text-slate-400 font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#390F1E] whitespace-nowrap">
                            {g.title}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#390F1E] font-mono tabular-nums whitespace-nowrap">
                            {formatIDR(g.targetAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-[#CB497C] font-mono tabular-nums whitespace-nowrap">
                            {formatIDR(g.currentAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                            {formatIDR(remaining)}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span className="font-bold text-xs text-[#6D1B3E] font-mono">{progress}%</span>
                          </td>
                          <td className="py-2.5 px-3 text-[#A93361] whitespace-nowrap">
                            {formatDateIndo(g.targetDate)}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          )}

          {/* TAB 5: MONTH-END RECONCILIATION */}
          {activeTab === 'reconciliation' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF4F2] text-[#6D1B3E] border-b border-[#F3AEC5]/50 font-bold">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Account</th>
                  <th className="py-2.5 px-3 text-right">App Balance</th>
                  <th className="py-2.5 px-3 text-right">M-Banking Balance</th>
                  <th className="py-2.5 px-3 text-right">Difference</th>
                  <th className="py-2.5 px-3">Reason / Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8E9E4]">
                {reconciliationLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No month-end reconciliation history yet.
                    </td>
                  </tr>
                ) : (
                  reconciliationLogs.map((l, idx) => (
                    <tr key={l.id} className="hover:bg-[#FAF4F2]/60 transition-colors">
                      <td className="py-2.5 px-3 text-center text-[11px] text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#390F1E] whitespace-nowrap">
                        {l.date}
                      </td>
                      <td className="py-2.5 px-3 text-[#6D1B3E] whitespace-nowrap font-bold">
                        {l.walletName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                        {formatIDR(l.appBalance)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap font-bold text-[#390F1E]">
                        {formatIDR(l.realBalance)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-extrabold font-mono tabular-nums whitespace-nowrap ${
                          l.difference >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {l.difference >= 0 ? `+${formatIDR(l.difference)}` : `-${formatIDR(Math.abs(l.difference))}`}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {l.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 6: SUMMARY KPI */}
          {activeTab === 'summary' && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-[#FAF4F2] rounded-2xl border border-[#F3AEC5]/50">
                  <span className="text-[11px] font-bold text-[#A93361] uppercase tracking-wider block">
                    Total Net Worth
                  </span>
                  <span className="text-2xl font-extrabold text-[#390F1E] font-mono tabular-nums block mt-1">
                    {formatIDR(totalNetWorth)}
                  </span>
                </div>
                <div className="p-4 bg-[#FAF4F2] rounded-2xl border border-[#F3AEC5]/50">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Monthly Income
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums block mt-1">
                    +{formatIDR(monthlyIncome)}
                  </span>
                </div>
                <div className="p-4 bg-[#FAF4F2] rounded-2xl border border-[#F3AEC5]/50">
                  <span className="text-[11px] font-bold text-[#CB497C] uppercase tracking-wider block">
                    Monthly Expense
                  </span>
                  <span className="text-2xl font-extrabold text-[#CB497C] font-mono tabular-nums block mt-1">
                    -{formatIDR(monthlyExpense)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
