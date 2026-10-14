/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { WalletsView } from './components/WalletsView';
import { GoalsAndRecurringView } from './components/GoalsAndRecurringView';
import { SpreadsheetView } from './components/SpreadsheetView';
import { TransactionModal } from './components/TransactionModal';
import { WalletModal } from './components/WalletModal';
import { TransferModal } from './components/TransferModal';
import { ReconciliationModal } from './components/ReconciliationModal';
import { SavingsGoalModal } from './components/SavingsGoalModal';
import { DepositGoalModal } from './components/DepositGoalModal';
import { RecurringModal } from './components/RecurringModal';
import { TransactionType, Wallet, SavingsGoal, RecurringTransaction } from './types/finance';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletToEdit, setWalletToEdit] = useState<Wallet | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState(false);
  const [reconciliationWalletId, setReconciliationWalletId] = useState<string | undefined>();

  const [isSavingsGoalModalOpen, setIsSavingsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [activeDepositGoal, setActiveDepositGoal] = useState<SavingsGoal | null>(null);

  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [recurringToEdit, setRecurringToEdit] = useState<RecurringTransaction | null>(null);

  const { savingsGoals } = useFinance();

  const handleOpenTransaction = (type: TransactionType) => {
    setTransactionType(type);
    setIsTransactionModalOpen(true);
  };

  const handleOpenWalletModal = (wallet?: Wallet) => {
    setWalletToEdit(wallet || null);
    setIsWalletModalOpen(true);
  };

  const handleOpenReconciliation = (walletId?: string) => {
    setReconciliationWalletId(walletId);
    setIsReconciliationModalOpen(true);
  };

  const handleOpenSavingsGoal = (goal?: SavingsGoal) => {
    setGoalToEdit(goal || null);
    setIsSavingsGoalModalOpen(true);
  };

  const handleOpenDepositGoal = (goalId: string) => {
    const target = savingsGoals.find(g => g.id === goalId);
    if (target) {
      setActiveDepositGoal(target);
      setIsDepositModalOpen(true);
    }
  };

  const handleOpenRecurringModal = (item?: RecurringTransaction) => {
    setRecurringToEdit(item || null);
    setIsRecurringModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF4F2] text-[#390F1E] flex flex-col antialiased">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenDailyInterest={() => handleOpenReconciliation()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-5 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenTransaction={handleOpenTransaction}
            onOpenTransfer={() => setIsTransferModalOpen(true)}
            onOpenReconciliation={handleOpenReconciliation}
            onOpenWalletModal={() => handleOpenWalletModal()}
            onOpenDepositGoal={handleOpenDepositGoal}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView onOpenTransaction={handleOpenTransaction} />
        )}

        {activeTab === 'wallets' && (
          <WalletsView
            onOpenWalletModal={handleOpenWalletModal}
            onOpenTransfer={() => setIsTransferModalOpen(true)}
            onOpenReconciliation={handleOpenReconciliation}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsAndRecurringView
            onOpenSavingsGoalModal={handleOpenSavingsGoal}
            onOpenDepositModal={goal => {
              setActiveDepositGoal(goal);
              setIsDepositModalOpen(true);
            }}
            onOpenRecurringModal={handleOpenRecurringModal}
          />
        )}

        {activeTab === 'spreadsheet' && <SpreadsheetView />}
      </main>

      {/* Mobile Ergonomic Bottom Nav */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenTransaction={handleOpenTransaction}
        onOpenTransfer={() => setIsTransferModalOpen(true)}
        onOpenReconciliation={() => handleOpenReconciliation()}
      />

      {/* Modals & Drawers */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        defaultType={transactionType}
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => {
          setIsWalletModalOpen(false);
          setWalletToEdit(null);
        }}
        walletToEdit={walletToEdit}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <ReconciliationModal
        isOpen={isReconciliationModalOpen}
        onClose={() => {
          setIsReconciliationModalOpen(false);
          setReconciliationWalletId(undefined);
        }}
        initialWalletId={reconciliationWalletId}
      />

      <SavingsGoalModal
        isOpen={isSavingsGoalModalOpen}
        onClose={() => {
          setIsSavingsGoalModalOpen(false);
          setGoalToEdit(null);
        }}
        goalToEdit={goalToEdit}
      />

      <DepositGoalModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setActiveDepositGoal(null);
        }}
        goal={activeDepositGoal}
      />

      <RecurringModal
        isOpen={isRecurringModalOpen}
        onClose={() => {
          setIsRecurringModalOpen(false);
          setRecurringToEdit(null);
        }}
        itemToEdit={recurringToEdit}
      />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}
