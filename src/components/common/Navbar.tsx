import React from 'react';
import { 
  Sparkles, 
  ScanBarcode, 
  UserCheck, 
  RotateCcw, 
  ShieldCheck, 
  KeyRound,
  LogOut,
  Home,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { StockSenseLogo } from './StockSenseLogo';

interface NavbarProps {
  onOpenCopilot: () => void;
  onOpenScanner: () => void;
  onOpenAuth: (mode?: 'login' | 'signup' | 'forgot_password') => void;
  onToggleLanding?: () => void;
  showingLanding?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenCopilot, 
  onOpenScanner, 
  onOpenAuth,
  onToggleLanding,
  showingLanding = false,
}) => {
  const { currentUser, logout, switchRole, isAuthenticated } = useAuth();
  const { resetDemoData, geminiApiKey, setGeminiApiKey } = useInventory();
  const [showKeyModal, setShowKeyModal] = React.useState(false);
  const [tempKey, setTempKey] = React.useState(geminiApiKey);

  const isManager = currentUser?.role === 'inventory_manager';

  const handleRoleToggle = () => {
    if (isManager) {
      switchRole('warehouse_staff');
    } else {
      switchRole('inventory_manager');
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between shadow-xs">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div 
            onClick={onToggleLanding}
            className="cursor-pointer transition-transform hover:scale-102"
            title="Click to view StockSense Home & Feature Showcase"
          >
            <StockSenseLogo size="md" showSubtitle={true} theme="light" />
          </div>

          {/* Toggle between Home/Features and Dashboard */}
          {onToggleLanding && (
            <button
              onClick={onToggleLanding}
              className={`hidden md:flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                showingLanding 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{showingLanding ? 'Return to Dashboard' : 'Features & Tour'}</span>
            </button>
          )}
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Scanner shortcut */}
          <button
            onClick={onOpenScanner}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            title="Scan SKU Barcode"
          >
            <ScanBarcode className="w-4 h-4 text-slate-600" />
            <span className="hidden md:inline">Barcode Scan</span>
          </button>

          {/* AI Copilot Button */}
          <button
            onClick={onOpenCopilot}
            className="relative flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg shadow-sm shadow-emerald-500/20 transition-all transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200 animate-spin" style={{ animationDuration: '6s' }} />
            <span>AI Copilot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping absolute -top-0.5 -right-0.5" />
          </button>

          {/* Role Switcher Pill */}
          {isAuthenticated && (
            <button
              onClick={handleRoleToggle}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                isManager
                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
              title="Click to switch persona (Manager vs Warehouse Staff)"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="font-semibold">{isManager ? 'Manager' : 'Staff'}</span>
              <span className="text-[10px] opacity-75 hidden sm:inline">(Toggle)</span>
            </button>
          )}


          {/* Gemini API Key config */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              geminiApiKey ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title="Configure optional Google Gemini API Key"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          {/* User profile / Auth buttons */}
          {currentUser ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/30">
                {currentUser.avatar || 'VR'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {currentUser.loginId ? `@${currentUser.loginId} • ` : ''}{currentUser.role.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                title="Sign out of Verix"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200">
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Gemini API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Google Gemini API Configuration</h3>
                <p className="text-xs text-slate-500">Optional live LLM integration</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              VERIX includes a high-accuracy, instant built-in NLP & forecasting engine that works out of the box with zero configuration. You can optionally connect your Google Gemini API key to enable live generative natural language reasoning.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Gemini API Key</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempKey}
                onChange={e => setTempKey(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setGeminiApiKey(tempKey);
                  setShowKeyModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
