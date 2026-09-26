import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Boxes, 
  ScanBarcode, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Layers, 
  Cpu, 
  Warehouse, 
  RefreshCw, 
  FileText, 
  ChevronRight,
  UserCheck,
  Zap,
  Clock,
  ShieldAlert,
  Check,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  Bot,
  AlertTriangle,
  BarChart3,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { StockSenseLogo } from '../common/StockSenseLogo';
import { useAuth } from '../../context/AuthContext';

interface LandingPageViewProps {
  onGoToDashboard: () => void;
  onOpenAuthModal: (mode: 'login' | 'signup' | 'forgot_password') => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onGoToDashboard,
  onOpenAuthModal,
}) => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [activeExplorerTab, setActiveExplorerTab] = useState<'ledger' | 'operations' | 'scanner' | 'ai' | 'security'>('ledger');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white font-sans">
      {/* ---------------- 1. STICKY TOP NAVIGATION BAR (LIGHT THEME) ---------------- */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        {/* Brand Logo: StockSense */}
        <div 
          className="flex items-center space-x-3 cursor-pointer" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <StockSenseLogo size="md" theme="light" showSubtitle={true} />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-7 text-xs font-semibold text-slate-600">
          <a href="#about-stocksense" className="hover:text-emerald-600 transition-colors">
            About StockSense
          </a>
          <a href="#core-features" className="hover:text-emerald-600 transition-colors">
            Core Features
          </a>
          <a href="#interactive-explorer" className="hover:text-emerald-600 transition-colors">
            System Explorer
          </a>
          <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">
            How It Works
          </a>
          <a href="#comparison" className="hover:text-emerald-600 transition-colors">
            Comparison
          </a>
          <a href="#enterprise-security" className="hover:text-emerald-600 transition-colors">
            Security & OTP
          </a>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={onGoToDashboard}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Dashboard ({currentUser?.name})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={logout}
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuthModal('signup')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ---------------- 2. HERO SECTION: INTRODUCING STOCKSENSE ---------------- */}
      <section className="relative pt-14 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Soft emerald/teal gradient glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 sm:w-[700px] h-96 sm:h-[480px] bg-gradient-to-tr from-emerald-100/70 via-teal-50/60 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center relative z-10 max-w-4xl mx-auto">
          {/* Announcement Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Boxes className="w-3.5 h-3.5 text-emerald-700" />
            <span>Next-Generation Warehouse Operating System & Stock Intelligence</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.12]">
            Total Warehouse Clarity. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
              Zero Inventory Shrinkage.
            </span>
          </h1>

          {/* Subheading telling what StockSense is */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Welcome to <span className="text-slate-900 font-bold">StockSense</span> (StoreSense) — the unified operational platform designed to eliminate stockouts, prevent phantom inventory, and streamline dock-to-dispatch operations. Built with strict double-entry ledger mechanics, optical camera barcode scanning, and predictive AI replenishment.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={onGoToDashboard}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all transform active:scale-95 flex items-center space-x-2 cursor-pointer"
            >
              <Boxes className="w-4 h-4" />
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAuthModal('login')}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 font-extrabold text-sm rounded-2xl shadow-xs transition-all cursor-pointer flex items-center space-x-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Sign In to Account</span>
            </button>

            <button
              onClick={() => onOpenAuthModal('signup')}
              className="px-5 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-sm rounded-2xl transition-all cursor-pointer flex items-center space-x-1.5 border border-emerald-200"
            >
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>Register via Phone OTP</span>
            </button>
          </div>

          {/* Key Value Metric Badges */}
          <div className="mt-14 pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">100%</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">Double-Entry Balance</p>
              <p className="text-[11px] text-slate-500">Zero untracked inventory moves</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xl sm:text-2xl font-black text-teal-600 font-mono">&lt; 150ms</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">Camera Barcode Scan</p>
              <p className="text-[11px] text-slate-500">Phone camera & laser scanner support</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xl sm:text-2xl font-black text-purple-600 font-mono">Predictive AI</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">Autonomous Reorders</p>
              <p className="text-[11px] text-slate-500">Burn rate forecasting before stockouts</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xl sm:text-2xl font-black text-cyan-600 font-mono">Verix Live</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">Real SMS Phone OTP</p>
              <p className="text-[11px] text-slate-500">High-security operator verification</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 3. ABOUT STOCKSENSE: THE PROBLEM WE SOLVE ---------------- */}
      <section id="about-stocksense" className="py-16 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Why StockSense?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Built to Solve Real-World Warehouse Chaos
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Traditional inventory systems rely on static spreadsheets or disconnected databases where numbers are overwritten manually. When counts don't match shelves, chaos ensues. Here is how StockSense changes that:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* The Old Way: Spreadsheets & Legacy Tools */}
            <div className="bg-rose-50/50 rounded-3xl p-7 border border-rose-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">The Problem with Traditional Systems</h3>
                    <p className="text-xs text-rose-700 font-medium">Why operations teams struggle daily</p>
                  </div>
                </div>

                <div className="space-y-3.5 mt-5 text-xs text-slate-700">
                  <div className="flex items-start space-x-3 p-3 bg-white/80 rounded-xl border border-rose-100">
                    <span className="font-bold text-rose-600 text-sm">✕</span>
                    <div>
                      <span className="font-bold text-slate-900 block">Phantom Stock & Mystery Discrepancies</span>
                      Spreadsheet quantities are simply overwritten with no recorded source or destination, making shrinkage untraceable.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white/80 rounded-xl border border-rose-100">
                    <span className="font-bold text-rose-600 text-sm">✕</span>
                    <div>
                      <span className="font-bold text-slate-900 block">Surprise Production Stoppages</span>
                      Managers realize parts are out of stock only when workers arrive at empty bins, delaying customer commitments.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white/80 rounded-xl border border-rose-100">
                    <span className="font-bold text-rose-600 text-sm">✕</span>
                    <div>
                      <span className="font-bold text-slate-900 block">Slow Manual Typing Errors</span>
                      Entering 12-digit serials and SKUs manually on paper clipboards leads to frequent typos and mismatched warehouse racks.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white/80 rounded-xl border border-rose-100">
                    <span className="font-bold text-rose-600 text-sm">✕</span>
                    <div>
                      <span className="font-bold text-slate-900 block">Unsecured Shared Logins</span>
                      Generic shared passwords allow untracked modifications with zero individual employee accountability.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* The StockSense Solution */}
            <div className="bg-emerald-50/50 rounded-3xl p-7 border border-emerald-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">The StockSense Solution</h3>
                    <p className="text-xs text-emerald-700 font-medium">Mathematical precision & modern automation</p>
                  </div>
                </div>

                <div className="space-y-3.5 mt-5 text-xs text-slate-700">
                  <div className="flex items-start space-x-3 p-3 bg-white/80 rounded-xl border border-emerald-100">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Strict Double-Entry Stock Accounting</span>
                      Every stock increase at a location requires an equal deduction elsewhere. Goods never vanish or appear without an audit trace.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white/80 rounded-xl border border-emerald-100">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Predictive AI Burn-Rate Forecasting</span>
                      Algorithms calculate exact days until exhaustion based on consumption velocity and draft purchase orders ahead of time.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white/80 rounded-xl border border-emerald-100">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Hardware & Mobile Camera Optical Scanning</span>
                      Warehouse workers point their phone or laser gun to instantly pull up product bins, stock counts, and initiate transfers.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white/80 rounded-xl border border-emerald-100">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Verified Operator Security via Verix Live OTP</span>
                      Operators log in with their phone number and verified SMS OTP, ensuring 100% authenticated employee transaction logs.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 4. THE 6 ARCHITECTURAL PILLARS OF STOCKSENSE ---------------- */}
      <section id="core-features" className="py-20 bg-slate-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
            <Boxes className="w-3.5 h-3.5" />
            <span>Comprehensive Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            The 6 Core Architectural Pillars of StockSense
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Every feature in StockSense is engineered to mirror the operational reality of physical warehouses, manufacturing lines, and distribution networks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pillar 1: Double-Entry Stock Movement Ledger */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 hover:border-emerald-500 hover:shadow-lg transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">1. Double-Entry Stock Movement Ledger</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Inherited from the rigorous principles of financial accounting. Inventory items never simply appear or disappear. Every move explicitly logs a <b>Source Location</b> and a <b>Destination Location</b>, providing a mathematically balanced and audit-proof ledger.
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Permanent, unalterable movement history</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Virtual accounts for Vendors, Customers, & Loss</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Exportable CSV audit records for compliance</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-700">
              <span>Mathematically Balanced</span>
            </div>
          </div>

          {/* Pillar 2: Dock-to-Dispatch Operations Pipeline */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 hover:border-teal-500 hover:shadow-lg transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <ArrowDownToLine className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">2. End-to-End Operations Pipeline</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Standardize your warehouse floor with strict operational stages: <b>Draft</b>, <b>Waiting</b>, <b>Ready</b>, and <b>Done</b>. Manage Supplier Inbound Receipts, Internal Putaways, and Customer Deliveries with stock reservation safety.
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span>Supplier Putaway with batch verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span>Free-to-Use stock reservation guarding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span>Kanban & List views with quick validation</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-teal-700">
              <span>Zero Overselling Guarantee</span>
            </div>
          </div>

          {/* Pillar 3: Optical Camera & Laser Barcode Scanner */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 hover:border-cyan-500 hover:shadow-lg transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <ScanBarcode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">3. Hardware & Mobile Barcode Scanner</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Turn any smartphone, iPad, or laptop webcam into an optical barcode reader. Fully compatible with industrial laser scanning guns (Zebra, Honeywell) via continuous keystroke wedge for zero-latency floor operations.
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Sub-150ms real-time optical decoding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Instant product details and rack bin locations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-cyan-600" />
                  <span>One-click stock transfer modal initiation</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-cyan-700">
              <span>Universal Hardware Support</span>
            </div>
          </div>

          {/* Pillar 4: AI Predictive Reordering & Copilot */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 hover:border-purple-500 hover:shadow-lg transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">4. AI Predictive Forecasting & Copilot</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Analyzes consumption velocity, reorder lead times, and seasonal fluctuations to calculate exact stockout dates. Features an interactive AI Copilot with optional Google Gemini integration for conversational supply chain analysis.
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  <span>Burn rate and exhaustion telemetry</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  <span>Autonomous purchase order generation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  <span>Natural language warehouse intelligence queries</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-purple-700">
              <span>Proactive Stockout Prevention</span>
            </div>
          </div>

          {/* Pillar 5: Multi-Warehouse Network & Bin Tracking */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 hover:border-blue-500 hover:shadow-lg transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Warehouse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">5. Multi-Warehouse Hubs & Bins</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Scale seamlessly across multi-city facilities. Model complex physical sites down to zones, aisles, racks, and specific bin numbers with visual capacity indicators and internal warehouse-to-warehouse logistics tracking.
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>Multi-hub inventory balance aggregation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>Rack-level capacity meters and heatmaps</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>Internal transit operations between depots</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-700">
              <span>Unlimited Multi-Location Scaling</span>
            </div>
          </div>

          {/* Pillar 6: Enterprise Security via Verix Phone OTP */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 hover:border-emerald-500 hover:shadow-lg transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">6. Enterprise Security & Verix Phone OTP</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Enterprise security built for warehouse workers. Accounts are protected by real-time SMS Phone OTP via the live Verix Gateway, eliminating vulnerable passwords and ensuring every stock transfer is signed by a verified operator.
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live SMS delivery directly to user handset</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Self-service 30-second password reset via OTP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Role-based access control (Manager vs Floor Staff)</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-700">
              <span>100% Authenticated Workforce</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 5. INTERACTIVE SYSTEM EXPLORER ---------------- */}
      <section id="interactive-explorer" className="py-20 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interactive Blueprint</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Explore the StockSense Engine in Action
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Select any operational subsystem below to see how StockSense processes physical inventory in real-time.
            </p>

            {/* Interactive Tab Selector Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setActiveExplorerTab('ledger')}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeExplorerTab === 'ledger'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                1. Double-Entry Ledger
              </button>
              <button
                onClick={() => setActiveExplorerTab('operations')}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeExplorerTab === 'operations'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                2. Operations Pipeline
              </button>
              <button
                onClick={() => setActiveExplorerTab('scanner')}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeExplorerTab === 'scanner'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                3. Barcode Scanner
              </button>
              <button
                onClick={() => setActiveExplorerTab('ai')}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeExplorerTab === 'ai'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                4. AI Forecasting
              </button>
              <button
                onClick={() => setActiveExplorerTab('security')}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeExplorerTab === 'security'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                5. Verix Phone OTP Security
              </button>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="bg-slate-50 p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
            {/* Tab 1: Ledger */}
            {activeExplorerTab === 'ledger' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Layers className="w-5 h-5 text-emerald-600" />
                      The Mathematical Double-Entry Architecture
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Every transaction credits a source and debits a destination. Total inventory across the universe is always conserved.
                    </p>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-mono bg-emerald-100 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
                    Audit Balanced
                  </span>
                </div>

                {/* Visual Flow diagram */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Source Account</span>
                    <p className="font-bold text-slate-800 text-sm">Vendors / Suppliers</p>
                    <span className="text-[11px] text-rose-600 font-mono font-bold">- 100 Units</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Validated Inbound Receipt
                    </span>
                    <ArrowRight className="w-5 h-5 text-emerald-600 my-1 hidden sm:block" />
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Destination Account</span>
                    <p className="font-bold text-slate-800 text-sm">WH1 / Main Store</p>
                    <span className="text-[11px] text-emerald-600 font-mono font-bold">+ 100 Units</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>How Shrinkage & Loss are Tracked</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    When physical cycle counts reveal damaged or missing stock, the item is moved to the virtual location <code>loc-loss (Virtual / Inventory Adjustments & Loss)</code>. This preserves historical accounting records without corrupting physical balance reports.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Operations */}
            {activeExplorerTab === 'operations' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <ArrowDownToLine className="w-5 h-5 text-teal-600" />
                      4-Stage Operations Lifecycle
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enforcing strict validation gates so operations can never skip verification.
                    </p>
                  </div>
                  <span className="text-[11px] text-teal-800 font-mono bg-teal-100 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
                    Validated Workflow
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs mb-2">1</span>
                    <p className="font-bold text-slate-900">Draft</p>
                    <p className="text-slate-500 text-[11px] mt-1">Order created, lines specified, awaiting supplier confirmation or picking.</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs mb-2">2</span>
                    <p className="font-bold text-slate-900">Waiting</p>
                    <p className="text-slate-500 text-[11px] mt-1">Pending physical arrival at dock or awaiting warehouse rack readiness.</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs mb-2">3</span>
                    <p className="font-bold text-slate-900">Ready</p>
                    <p className="text-slate-500 text-[11px] mt-1">Stock reserved, items physically staged for inspection and putaway.</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs mb-2">4</span>
                    <p className="font-bold text-slate-900">Done (Validated)</p>
                    <p className="text-slate-500 text-[11px] mt-1">Stock ledger updated in real-time, responsible operator stamped.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Scanner */}
            {activeExplorerTab === 'scanner' && (
              <div className="space-y-6 text-center py-2">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <ScanBarcode className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Instant Optical Camera & Laser Scan Engine</h3>
                  <p className="text-xs text-slate-600 max-w-lg mx-auto mt-1">
                    Equip your floor workers without buying costly proprietary terminals. Any smartphone camera reads Code 128, EAN-13, and QR codes instantly.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-left max-w-3xl mx-auto">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">1. Optical Scan</p>
                    <p className="text-slate-500 text-[11px]">Worker aims phone camera or pulls trigger on Bluetooth laser gun.</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">2. Instant SKU Match</p>
                    <p className="text-slate-500 text-[11px]">Sub-150ms lookup reveals item name, rack location, and stock on hand.</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">3. Direct Transfer Action</p>
                    <p className="text-slate-500 text-[11px]">Tap to move stock into assembly racks or complete customer pick orders.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: AI */}
            {activeExplorerTab === 'ai' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Predictive Stockout Forecasting & Smart Reordering
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Preventing manufacturing downtime by projecting consumption velocity against safety thresholds.
                    </p>
                  </div>
                  <span className="text-[11px] text-purple-800 font-mono bg-purple-100 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
                    Continuous Analysis
                  </span>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="font-bold text-slate-900 text-sm">Example: High Tensile Fasteners (FAS-BLT-008)</span>
                    <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[11px]">
                      Exhaustion Risk in 48 Hours
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-100 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">Current Stock</span>
                      <span className="font-bold text-rose-600">12 Units</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">Safety Min</span>
                      <span className="font-bold text-slate-800">50 Units</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">Daily Burn Rate</span>
                      <span className="font-bold text-slate-800">6.0 Units/Day</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">Suggested Reorder</span>
                      <span className="font-bold text-emerald-600">+ 150 Units</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-3">
                    StockSense automatically flags items crossing below minimum quantities and allows one-click generation of supplier receipt orders.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 5: Security */}
            {activeExplorerTab === 'security' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      Live Verix Phone OTP Security Standard
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Zero generic logins. Every action on the warehouse floor is tied to a verified mobile identity.
                    </p>
                  </div>
                  <span className="text-[11px] text-blue-800 font-mono bg-blue-100 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
                    Live SMS Gateway
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">1. Operator Registration</p>
                    <p className="text-slate-500 text-[11px]">Worker registers with unique Login ID and verified mobile phone number via real-time SMS.</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">2. Role-Based Permissions</p>
                    <p className="text-slate-500 text-[11px]">Distinguish Warehouse Managers (inventory validation & adjustments) from Floor Pickers.</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">3. Self-Service Recovery</p>
                    <p className="text-slate-500 text-[11px]">Forgot password? Instant phone verification enables password reset in under 30 seconds.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- 6. HOW MODERN WAREHOUSES OPERATE WITH STOCKSENSE ---------------- */}
      <section id="how-it-works" className="py-20 bg-slate-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Workflow Walkthrough</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            A Day in the Life of a Warehouse on StockSense
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            From the moment freight trucks arrive at your receiving docks to the final customer delivery, see how StockSense orchestrates every move.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 font-black flex items-center justify-center text-xs mb-3">
                01
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Supplier Delivery</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Truck arrives at inbound dock. Staff opens Inbound Receipts and scans the vendor packing slip.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-700">
              WH/IN/0001
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 font-black flex items-center justify-center text-xs mb-3">
                02
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Putaway to Racks</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Worker uses mobile camera to scan the storage rack bin and transfers goods from dock to Main Store.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-teal-700">
              Bin Location Sync
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 font-black flex items-center justify-center text-xs mb-3">
                03
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Internal Transfers</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Assembly cells request parts. An internal transfer shifts stock to production racks with instant ledger debit/credit.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-cyan-700">
              WH/INT/0002
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 font-black flex items-center justify-center text-xs mb-3">
                04
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">AI Reorder Check</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Algorithms detect stock approaching safety min and alert purchasing with exact suggested reorder volumes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-purple-700">
              Zero Stockouts
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-black flex items-center justify-center text-xs mb-3">
                05
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Customer Dispatch</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dispatch bay stages items. Free-to-use stock calculation prevents overselling; shipment validated as Done.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-blue-700">
              WH/OUT/0001
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 7. COMPARISON: STOCKSENSE VS TRADITIONAL SPREADSHEETS ---------------- */}
      <section id="comparison" className="py-20 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              How StockSense Compares
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Why fast-growing supply chains migrate from Excel, Sheets, and rigid ERPs to StockSense.
            </p>
          </div>

          <div className="overflow-x-auto bg-slate-50 rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-bold">Capability</th>
                  <th className="py-3 px-4 font-bold text-rose-600">Spreadsheets & Sheets</th>
                  <th className="py-3 px-4 font-bold text-slate-500">Legacy ERP Terminals</th>
                  <th className="py-3 px-4 font-bold text-emerald-700 bg-emerald-50 rounded-t-xl">StockSense</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Inventory Tracking Integrity</td>
                  <td className="py-3.5 px-4 text-slate-500">Manual cell overwrite (Unverifiable)</td>
                  <td className="py-3.5 px-4 text-slate-500">Batch-processed overnight</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700 bg-emerald-50/50">Mathematical Double-Entry Real-time</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Barcode Scanning</td>
                  <td className="py-3.5 px-4 text-slate-500">None (Manual typing)</td>
                  <td className="py-3.5 px-4 text-slate-500">$2,000+ proprietary handhelds</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700 bg-emerald-50/50">Phone camera + Laser scanner</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Stockout Warnings</td>
                  <td className="py-3.5 px-4 text-slate-500">Reactive (Found empty on shelf)</td>
                  <td className="py-3.5 px-4 text-slate-500">Static rule alerts only</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700 bg-emerald-50/50">Predictive Burn-Rate AI Forecasting</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Authentication & Security</td>
                  <td className="py-3.5 px-4 text-slate-500">Unprotected shared file link</td>
                  <td className="py-3.5 px-4 text-slate-500">Shared passwords on terminals</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700 bg-emerald-50/50">Live Verix Phone SMS OTP + RBAC</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Audit Trail & Compliance</td>
                  <td className="py-3.5 px-4 text-slate-500">Untraceable who made changes</td>
                  <td className="py-3.5 px-4 text-slate-500">Complex database queries required</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700 bg-emerald-50/50">Cryptographic timestamp & user attribution</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ---------------- 8. ENTERPRISE SECURITY & VERIX LIVE OTP EXPLANATION ---------------- */}
      <section id="enterprise-security" className="py-20 bg-slate-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-white to-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Verix Live SMS Verification Active</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Enterprise-Grade Security Powered by Verix
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Warehouse security requires foolproof identity verification. StockSense connects to the live Verix SMS Gateway API to guarantee that every user action is authenticated.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Phone Number Authentication</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Register and log in using your verified mobile phone number with instant SMS delivery straight to your handset.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">30-Second Self-Service Reset</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Forgot password? Request an OTP code to your phone number and reset your credentials securely without IT delays.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                <UserCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Verified Audit Attribution</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every stock movement in the ledger is watermarked with the verified operator's name and role for full compliance.
              </p>
            </div>
          </div>

          {/* Action buttons inside Security section that trigger the clean modal */}
          <div className="mt-10 text-center flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onOpenAuthModal('login')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
            >
              Sign In to Your Account &rarr;
            </button>
            <button
              onClick={() => onOpenAuthModal('signup')}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
            >
              Create New Account (Phone OTP)
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- 9. FREQUENTLY ASKED QUESTIONS (FAQ) ---------------- */}
      <section className="py-16 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Everything you need to know about StockSense.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "What makes StockSense different from ordinary inventory spreadsheets?",
                a: "Unlike spreadsheets where stock numbers are overwritten with no record, StockSense operates on mathematical double-entry accounting. Every movement has an origin and destination location, ensuring zero unexplained shrinkage and providing an unalterable audit ledger."
              },
              {
                q: "How does the barcode scanner work without expensive hardware?",
                a: "StockSense includes an optical camera scanner that runs directly in your browser on smartphones, tablets, and laptops. Additionally, it natively supports physical USB or Bluetooth laser scanner guns with keyboard-wedge continuous capture."
              },
              {
                q: "How does the live Verix Phone OTP authentication work?",
                a: "StockSense integrates directly with the live Verix SMS Gateway API. When registering or requesting a password reset, a secure numeric code is dispatched to your phone number via SMS to authenticate your operator identity."
              },
              {
                q: "Can StockSense handle multiple warehouses in different cities?",
                a: "Yes. StockSense features multi-warehouse and bin-level location hierarchies. You can configure multiple facilities (e.g. WH1 Main Manufacturing, WH2 Central Depot) and track internal transfers between hubs with full in-transit visibility."
              },
              {
                q: "What is the Free-to-Use stock column in the product list?",
                a: "Free-to-Use stock represents physical on-hand inventory minus quantities reserved in pending customer deliveries. This prevents warehouse staff from accidentally picking or promising items that are already allocated."
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between font-bold text-slate-900 text-xs sm:text-sm cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-emerald-600 font-bold ml-4">
                    {activeFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- 10. FINAL BOTTOM CALL TO ACTION BANNER ---------------- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 sm:p-14 text-white overflow-hidden shadow-xl text-center">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Upgrade Your Warehouse Intelligence?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-emerald-50 leading-relaxed">
              Experience seamless double-entry tracking, real-time barcode scanning, and AI-driven replenishment today.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onGoToDashboard}
                className="px-7 py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-sm rounded-2xl shadow-lg transition-all cursor-pointer flex items-center space-x-2"
              >
                <Boxes className="w-4 h-4 text-emerald-600" />
                <span>Open Live Dashboard</span>
              </button>
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-7 py-3.5 bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl border border-emerald-400/40 shadow-xs transition-all cursor-pointer flex items-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Sign In to Account</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 11. CLEAN LIGHT THEME FOOTER ---------------- */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-4 sm:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <StockSenseLogo size="sm" theme="light" showSubtitle={false} />
            <span className="text-xs text-slate-500">
              © {new Date().getFullYear()} StockSense Intelligent Warehouse Systems. All rights reserved.
            </span>
          </div>

          <div className="flex items-center space-x-5 text-xs text-slate-600 font-medium">
            <button onClick={() => onOpenAuthModal('login')} className="hover:text-emerald-600 transition-colors cursor-pointer">
              Sign In
            </button>
            <button onClick={() => onOpenAuthModal('signup')} className="hover:text-emerald-600 transition-colors cursor-pointer">
              Register (Phone OTP)
            </button>
            <button onClick={() => onOpenAuthModal('forgot_password')} className="hover:text-emerald-600 transition-colors cursor-pointer">
              Forgot Password
            </button>
            <button onClick={onGoToDashboard} className="hover:text-emerald-700 text-emerald-600 font-bold transition-colors cursor-pointer">
              Open Dashboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
