import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Settings,
  ArrowLeft,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { unlockVault, changePassword, resetPasswordToDefault, hasCustomPassword } = useFinance();

  const [isSettingsView, setIsSettingsView] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Change password inputs
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [changeSuccessMsg, setChangeSuccessMsg] = useState('');
  const [changeErrorMsg, setChangeErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const success = unlockVault(passwordInput);
    if (success) {
      setPasswordInput('');
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg('Incorrect password. Please try again.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeErrorMsg('');
    setChangeSuccessMsg('');

    if (newPasswordInput !== confirmPasswordInput) {
      setChangeErrorMsg('New password and confirmation do not match.');
      return;
    }

    const res = changePassword(currentPasswordInput, newPasswordInput);
    if (res.success) {
      setChangeSuccessMsg('Password changed successfully!');
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setTimeout(() => {
        setChangeSuccessMsg('');
        setIsSettingsView(false);
      }, 1500);
    } else {
      setChangeErrorMsg(res.error || 'Failed to change password.');
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Reset password back to default?')) {
      resetPasswordToDefault();
      setChangeSuccessMsg('Password has been reset.');
      setTimeout(() => setChangeSuccessMsg(''), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#390F1E]/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-[#F8E9E4] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-br from-[#FAF4F2] to-[#F8E9E4] border-b border-[#F8E9E4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSettingsView && (
              <button
                type="button"
                onClick={() => setIsSettingsView(false)}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-[#390F1E] flex items-center justify-center transition-colors shadow-2xs mr-1"
                title="Back"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <h3 className="text-lg font-bold text-[#390F1E] font-serif-brand">
              {isSettingsView ? 'Change Password' : 'Enter Password'}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Settings logo button at the top */}
            <button
              type="button"
              onClick={() => setIsSettingsView(!isSettingsView)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-2xs ${
                isSettingsView
                  ? 'bg-[#6D1B3E] text-white'
                  : 'bg-white/80 hover:bg-white text-slate-600 hover:text-[#390F1E]'
              }`}
              title={isSettingsView ? 'Back to Enter Password' : 'Password Settings'}
            >
              <Settings size={16} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-[#390F1E] flex items-center justify-center transition-colors shadow-2xs"
              title="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* View 1: Unlock with Password */}
        {!isSettingsView ? (
          <div className="p-6 space-y-4">
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#6D1B3E] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoFocus
                    placeholder="Enter password..."
                    value={passwordInput}
                    onChange={e => {
                      setPasswordInput(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all pr-12 ${
                      errorMsg
                        ? 'border-red-300 focus:border-red-500 bg-red-50/30'
                        : 'border-[#F3AEC5]/50 focus:border-[#CB497C] focus:ring-2 focus:ring-[#CB497C]/15 bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#6D1B3E] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 mt-2">
                    <AlertCircle size={14} />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#6D1B3E] to-[#CB497C] hover:from-[#5A1432] hover:to-[#B53E6D] text-white font-bold text-sm shadow-md shadow-[#6D1B3E]/15 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Unlock size={17} />
                <span>Unlock</span>
              </button>
            </form>
          </div>
        ) : (
          /* View 2: Change Password Settings */
          <form onSubmit={handleChangePassword} className="p-6 space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#6D1B3E] mb-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="Enter current password..."
                value={currentPasswordInput}
                onChange={e => setCurrentPasswordInput(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3AEC5]/50 focus:border-[#CB497C] outline-none text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6D1B3E] mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password..."
                value={newPasswordInput}
                onChange={e => setNewPasswordInput(e.target.value)}
                required
                minLength={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3AEC5]/50 focus:border-[#CB497C] outline-none text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6D1B3E] mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password..."
                value={confirmPasswordInput}
                onChange={e => setConfirmPasswordInput(e.target.value)}
                required
                minLength={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3AEC5]/50 focus:border-[#CB497C] outline-none text-xs font-medium"
              />
            </div>

            {changeErrorMsg && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                <AlertCircle size={14} />
                <span>{changeErrorMsg}</span>
              </div>
            )}

            {changeSuccessMsg && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <CheckCircle2 size={14} />
                <span>{changeSuccessMsg}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#6D1B3E] hover:bg-[#5A1432] text-white font-bold text-xs transition-colors shadow-xs"
              >
                Save New Password
              </button>
              {hasCustomPassword && (
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  title="Reset to default password"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
