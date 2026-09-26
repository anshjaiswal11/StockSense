import React, { useState } from 'react';
import { User, KeyRound, Mail, Lock, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, signup, sendPasswordResetOTP, verifyOTPAndResetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [email, setEmail] = useState('ansh.jaiswal@stocksense.io');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Ansh Jaiswal');
  const [role, setRole] = useState<Role>('inventory_manager');

  // OTP Reset flow state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpNotification, setOtpNotification] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      login(email, role);
      onClose();
    } else if (mode === 'signup') {
      signup(name, email, role);
      onClose();
    } else if (mode === 'forgot_password') {
      if (!otpSent) {
        const res = sendPasswordResetOTP(email);
        setOtpSent(true);
        setOtpNotification(res.message);
      } else {
        const success = verifyOTPAndResetPassword(email, otpCode, newPassword);
        if (success) {
          alert('Password successfully reset! You can now log in.');
          setMode('login');
          setOtpSent(false);
        } else {
          alert('Invalid OTP code. Try entering 123456 or the code shown.');
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'login'
                  ? 'Sign In to StockSense'
                  : mode === 'signup'
                  ? 'Create New Account'
                  : 'OTP Password Reset'}
              </h3>
              <p className="text-xs text-slate-500">Access role-based IMS dashboard</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {otpNotification && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
            {otpNotification}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          )}

          {mode !== 'forgot_password' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
              >
                <option value="inventory_manager">Inventory Manager (Full Oversight)</option>
                <option value="warehouse_staff">Warehouse Staff (Floor & Scans)</option>
              </select>
            </div>
          )}

          {mode === 'forgot_password' && otpSent && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Enter 6-Digit OTP Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-center tracking-widest text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm text-xs transition-all"
            >
              {mode === 'login'
                ? 'Sign In & Redirect to Dashboard'
                : mode === 'signup'
                ? 'Register Account'
                : otpSent
                ? 'Verify OTP & Reset Password'
                : 'Send Verification OTP'}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {mode === 'login' ? (
            <>
              <button
                onClick={() => setMode('forgot_password')}
                className="text-emerald-700 hover:underline"
              >
                Forgot Password (OTP)?
              </button>
              <button
                onClick={() => setMode('signup')}
                className="text-slate-700 font-bold hover:underline"
              >
                Create Account
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setMode('login');
                setOtpSent(false);
              }}
              className="text-emerald-700 hover:underline"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
