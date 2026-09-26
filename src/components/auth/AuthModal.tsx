import React from 'react';
import { X } from 'lucide-react';
import { AuthCard } from './AuthCard';

interface AuthModalProps {
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot_password';
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialMode = 'login' }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-md my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-9 h-9 bg-white text-slate-500 hover:text-slate-900 rounded-full shadow-lg border border-slate-200 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Core Auth Card */}
        <AuthCard initialMode={initialMode} onSuccess={onClose} isModal={true} />
      </div>
    </div>
  );
};
