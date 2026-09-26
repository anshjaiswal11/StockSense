import React, { useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductListView } from './components/products/ProductListView';
import { OperationsView } from './components/operations/OperationsView';
import { WarehouseSettingsView } from './components/settings/WarehouseSettingsView';
import { AIPredictiveForecastView } from './components/ai/AIPredictiveForecastView';
import { AICopilotModal } from './components/ai/AICopilotModal';
import { BarcodeScannerModal } from './components/scanner/BarcodeScannerModal';
import { AuthModal } from './components/auth/AuthModal';
import { OperationModal } from './components/operations/OperationModal';
import { LandingPageView } from './components/home/LandingPageView';
import { useAuth } from './context/AuthContext';
import { OperationType } from './types';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ScanLine 
} from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Primary View Mode: 'landing' (Home page with feature explanations) vs 'dashboard' (IMS App)
  // Defaults to 'landing' so that anyone clicking the website is first introduced to the features, then logs in!
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');

  // Dashboard Sub-Tab
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Modals
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [isNewOpOpen, setIsNewOpOpen] = useState(false);
  const [newOpType, setNewOpType] = useState<OperationType>('receipt');

  const handleOpenAuthModal = (mode: 'login' | 'signup' | 'forgot_password' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthOpen(true);
  };

  const handleOpenNewOperation = (type: OperationType = 'receipt') => {
    setNewOpType(type);
    setIsNewOpOpen(true);
  };

  const handleOpenTransferForProduct = (_productId: string) => {
    setNewOpType('internal');
    setIsNewOpOpen(true);
  };

  // If in 'landing' view mode, render the Home Page with feature explanation & login/signup
  if (viewMode === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
        <LandingPageView
          onGoToDashboard={() => setViewMode('dashboard')}
          onOpenAuthModal={handleOpenAuthModal}
        />

        {/* Global Modals in Landing view */}
        {isAuthOpen && (
          <AuthModal
            initialMode={authModalMode}
            onClose={() => {
              setIsAuthOpen(false);
              // If user became authenticated via modal, optionally take them to dashboard
              if (isAuthenticated) {
                setViewMode('dashboard');
              }
            }}
          />
        )}
      </div>
    );
  }

  // Dashboard / IMS View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navigation */}
      <Navbar
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAuth={handleOpenAuthModal}
        onToggleLanding={() => setViewMode('landing')}
        showingLanding={false}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={tab => {
          if (tab === 'scanner') {
            setIsScannerOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                onOpenNewOperation={handleOpenNewOperation}
                onNavigateTab={tab => setCurrentTab(tab as NavTab)}
              />
            )}

            {currentTab === 'products' && <ProductListView />}

            {(currentTab === 'receipts' ||
              currentTab === 'delivery' ||
              currentTab === 'internal' ||
              currentTab === 'adjustments' ||
              currentTab === 'history') && (
              <OperationsView
                currentTab={currentTab}
                onOpenNewOperation={handleOpenNewOperation}
              />
            )}

            {currentTab === 'warehouses' && <WarehouseSettingsView />}

            {currentTab === 'ai_forecast' && <AIPredictiveForecastView />}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar for Tablets & Phones */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around z-20 shadow-lg">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center text-[10px] font-semibold ${
            currentTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentTab('products')}
          className={`flex flex-col items-center text-[10px] font-semibold ${
            currentTab === 'products' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Products</span>
        </button>

        <button
          onClick={() => setCurrentTab('receipts')}
          className={`flex flex-col items-center text-[10px] font-semibold ${
            currentTab === 'receipts' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <ArrowDownToLine className="w-5 h-5 mb-0.5" />
          <span>Receipts</span>
        </button>

        <button
          onClick={() => setCurrentTab('delivery')}
          className={`flex flex-col items-center text-[10px] font-semibold ${
            currentTab === 'delivery' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <ArrowUpFromLine className="w-5 h-5 mb-0.5" />
          <span>Deliveries</span>
        </button>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex flex-col items-center text-[10px] font-semibold text-emerald-600"
        >
          <ScanLine className="w-5 h-5 mb-0.5" />
          <span>Scanner</span>
        </button>
      </nav>

      {/* Global Modals */}
      {isCopilotOpen && (
        <AICopilotModal
          onClose={() => setIsCopilotOpen(false)}
          onNavigateTab={tab => setCurrentTab(tab as NavTab)}
        />
      )}

      {isScannerOpen && (
        <BarcodeScannerModal
          onClose={() => setIsScannerOpen(false)}
          onOpenTransfer={handleOpenTransferForProduct}
        />
      )}

      {isAuthOpen && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setIsAuthOpen(false)}
        />
      )}

      {isNewOpOpen && (
        <OperationModal
          initialType={newOpType}
          onClose={() => setIsNewOpOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
