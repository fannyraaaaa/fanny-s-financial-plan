import React from 'react';
import { Plus, CreditCard, ArrowRightLeft, Edit2, Trash2, Scale, Lock, Unlock } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Wallet } from '../types/finance';
import { formatIDR } from '../utils/formatters';
import { IconRenderer } from './IconRenderer';

interface WalletsViewProps {
  onOpenWalletModal: (wallet?: Wallet) => void;
  onOpenTransfer: () => void;
  onOpenReconciliation: (walletId?: string) => void;
}

export const WalletsView: React.FC<WalletsViewProps> = ({
  onOpenWalletModal,
  onOpenTransfer,
  onOpenReconciliation,
}) => {
  const { wallets, deleteWallet, isUnlocked, openPasswordModal } = useFinance();

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#390F1E] font-serif-brand">
              Wallets & Accounts
            </h1>
            {!isUnlocked && (
              <button
                type="button"
                onClick={openPasswordModal}
                className="px-2.5 py-1 rounded-full bg-[#FAF4F2] hover:bg-[#F8E9E4] text-[#6D1B3E] text-[10px] font-bold flex items-center gap-1 border border-[#F3AEC5]/50 transition-colors cursor-pointer shadow-2xs active:scale-95"
                title="Locked - Tap to enter password"
              >
                <Lock size={11} className="text-[#CB497C]" />
                <span>Locked</span>
              </button>
            )}
          </div>
          <p className="text-xs text-[#A93361]">Manage debit cards, cash, e-wallets & bank accounts</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!isUnlocked) {
                openPasswordModal();
                return;
              }
              onOpenReconciliation();
            }}
            className="px-3 py-2 rounded-xl bg-white border border-[#F3AEC5] text-[#6D1B3E] font-semibold text-xs flex items-center gap-1 shadow-2xs hover:bg-[#FAF4F2]"
            title={!isUnlocked ? "Masukkan password untuk rekonsiliasi" : "Reconcile"}
          >
            <Scale size={14} />
            <span>Reconcile</span>
          </button>
          <button
            onClick={() => {
              if (!isUnlocked) {
                openPasswordModal();
                return;
              }
              onOpenTransfer();
            }}
            className="px-3 py-2 rounded-xl bg-white border border-[#F3AEC5] text-[#6D1B3E] font-semibold text-xs flex items-center gap-1 shadow-2xs hover:bg-[#FAF4F2]"
            title={!isUnlocked ? "Masukkan password untuk transfer" : "Transfer"}
          >
            <ArrowRightLeft size={14} />
            <span>Transfer</span>
          </button>
          <button
            onClick={() => {
              if (!isUnlocked) {
                openPasswordModal();
                return;
              }
              onOpenWalletModal();
            }}
            className="px-3.5 py-2 rounded-xl bg-[#CB497C] hover:bg-[#A93361] text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
            title={!isUnlocked ? "Masukkan password untuk tambah dompet" : "Add Wallet"}
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Monthly Reconciliation Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F8E9E4] to-white border border-[#F3AEC5] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#6D1B3E] text-white flex items-center justify-center shrink-0">
            <Scale size={16} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#390F1E]">Month-End Bank Reconciliation</h4>
            <p className="text-[11px] text-[#A93361]">Quick sync real m-banking balance & book interest</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (!isUnlocked) {
              openPasswordModal();
              return;
            }
            onOpenReconciliation();
          }}
          className="px-3.5 py-1.5 rounded-xl bg-[#6D1B3E] text-white text-xs font-bold hover:bg-[#390F1E] transition-colors shrink-0"
          title={!isUnlocked ? "Masukkan password untuk rekonsiliasi" : "Match Balance"}
        >
          Match Balance
        </button>
      </div>

      {/* Wallets Grid / Empty State */}
      {wallets.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-[#F3AEC5] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF4F2] text-[#CB497C] flex items-center justify-center mx-auto">
            <CreditCard size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#390F1E]">No Wallets or Accounts Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Start managing your finances by adding your first debit card, cash, or e-wallet.
            </p>
          </div>
          <button
            onClick={() => {
              if (!isUnlocked) {
                openPasswordModal();
                return;
              }
              onOpenWalletModal();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-[#CB497C] hover:bg-[#A93361] rounded-xl transition-all shadow-xs"
          >
            + Add First Wallet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {wallets.map(w => (
            <div
              key={w.id}
              className="p-5 rounded-3xl text-white shadow-md flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-lg"
              style={{ backgroundColor: w.color }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider opacity-80 block">
                    {w.typeLabel}
                  </span>
                  <h3 className="text-base font-bold mt-0.5">{w.name}</h3>
                  {w.accountNumber && (
                    <p className="text-[11px] font-mono opacity-75 mt-0.5">{w.accountNumber}</p>
                  )}
                </div>

                <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <IconRenderer name={w.icon} size={18} />
                </div>
              </div>

              {/* Bottom row */}
              <div className="mt-6 pt-3 border-t border-white/20 flex items-end justify-between">
                <div>
                  <span className="text-[10px] opacity-75 block">Current Balance</span>
                  {isUnlocked ? (
                    <span className="text-lg font-extrabold font-mono tabular-nums">
                      {formatIDR(w.balance)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={openPasswordModal}
                      className="text-base font-extrabold font-mono tracking-widest text-white/90 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer group"
                      title="Tap to unlock"
                    >
                      <span>••••••••</span>
                      <Lock size={12} className="opacity-80 group-hover:scale-110 transition-transform" />
                    </button>
                  )}
                  {w.lastReconciledDate && (
                    <p className="text-[10px] opacity-75 mt-0.5">
                      Reconciled: {w.lastReconciledDate}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (!isUnlocked) {
                        openPasswordModal();
                        return;
                      }
                      onOpenReconciliation(w.id);
                    }}
                    className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                    title={!isUnlocked ? "Masukkan password untuk rekonsiliasi" : "Reconcile Bank Balance"}
                  >
                    <Scale size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (!isUnlocked) {
                        openPasswordModal();
                        return;
                      }
                      onOpenWalletModal(w);
                    }}
                    className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                    title={!isUnlocked ? "Masukkan password untuk edit dompet" : "Edit Wallet"}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (!isUnlocked) {
                        openPasswordModal();
                        return;
                      }
                      if (window.confirm(`Delete wallet "${w.name}"?`)) {
                        deleteWallet(w.id);
                      }
                    }}
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-red-500/50 flex items-center justify-center text-white transition-colors"
                    title="Delete Wallet"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
