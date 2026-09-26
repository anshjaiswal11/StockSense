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
  Bot
} from 'lucide-react';
import { StockSenseLogo } from '../common/StockSenseLogo';
import { AuthCard } from '../auth/AuthCard';
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
  const [activeFeatureTab, setActiveFeatureTab] = useState<'otp' | 'ledger' | 'scanner' | 'ai' | 'ops'>('otp');
  const [authViewTab, setAuthViewTab] = useState<'login' | 'signup' | 'forgot_password'>('login');

  const scrollToAuthSection = (targetMode: 'login' | 'signup' | 'forgot_password' = 'login') => {
    setAuthViewTab(targetMode);
    const element = document.getElementById('auth-portal-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white font-sans">
      {/* ---------------- 1. LIGHT THEME STICKY TOP NAVIGATION BAR ---------------- */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        {/* Brand Logo: StockSense */}
        <div 
          className="flex items-center space-x-3 cursor-pointer" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <StockSenseLogo size="md" theme="light" showSubtitle={true} />
        </div>

        {/* Desktop Quick Nav Links */}
        <div className="hidden lg:flex items-center space-x-7 text-xs font-semibold text-slate-600">
          <a href="#features-section" className="hover:text-emerald-600 transition-colors">
            Feature Architecture
          </a>
          <a href="#otp-security-section" className="hover:text-emerald-600 transition-colors">
            Verix Live OTP
          </a>
          <a href="#wireframe-specs-section" className="hover:text-emerald-600 transition-colors">
            System Specs
          </a>
          <a href="#auth-portal-section" className="hover:text-emerald-600 transition-colors">
            Access Portal
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
                onClick={() => scrollToAuthSection('login')}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => scrollToAuthSection('signup')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Sign Up (Phone OTP)
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ---------------- 2. LIGHT THEME HERO SECTION ---------------- */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Soft emerald radial wash */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 sm:w-[650px] h-96 sm:h-[450px] bg-gradient-to-tr from-emerald-100/60 via-teal-50/50 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center relative z-10 max-w-4xl mx-auto">
          {/* Announcement Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
            <span>Verix Live SMS OTP Gateway Integrated • Phone Verification Active</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-tight">
            Intelligent Inventory. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
              Secured with Phone OTP.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to <span className="text-slate-900 font-bold">StockSense</span> (StoreSense) — the enterprise-grade inventory intelligence platform. Features double-entry stock movements, AI stockout forecasting, camera barcode scanning, and live Verix phone OTP authentication.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => scrollToAuthSection('login')}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all transform active:scale-95 flex items-center space-x-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Login with Phone & Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToAuthSection('signup')}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 font-extrabold text-sm rounded-2xl shadow-xs transition-all cursor-pointer flex items-center space-x-2"
            >
              <span>Register via Phone OTP</span>
            </button>

            <button
              onClick={onGoToDashboard}
              className="px-5 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-sm rounded-2xl transition-all cursor-pointer flex items-center space-x-1.5 border border-emerald-200"
            >
              <span>Explore Live Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Bar in Light Theme */}
          <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">Verix Live</p>
              <p className="text-xs text-slate-500 mt-0.5">Real SMS OTP Auth</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xl sm:text-2xl font-black text-teal-600 font-mono">Double-Entry</p>
              <p className="text-xs text-slate-500 mt-0.5">Zero Phantom Stock</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xl sm:text-2xl font-black text-cyan-600 font-mono">&lt; 150ms</p>
              <p className="text-xs text-slate-500 mt-0.5">Camera Barcode Scan</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xl sm:text-2xl font-black text-purple-600 font-mono">AI Forecast</p>
              <p className="text-xs text-slate-500 mt-0.5">Autonomous Reorders</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 3. WHAT IS STOCKSENSE & DETAILED FEATURE EXPLANATION ---------------- */}
      <section id="features-section" className="py-16 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
              <Boxes className="w-3.5 h-3.5" />
              <span>Full Platform Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              The Architecture & Core Features of StockSense
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              StockSense (StoreSense) provides an end-to-end operational operating system for warehouse floor managers and supply chain directors. Here is how each core feature works:
            </p>
          </div>

          {/* 6 Core Feature Explanation Cards in Light Theme */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Verix Phone OTP Security */}
            <div id="otp-security-section" className="bg-slate-50 p-6 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">1. Verix Live Phone OTP Security</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Powered by the live Verix OTP Gateway with your dedicated API key. Users register with their real phone number and verify via instant SMS OTP. Provides phone-based self-service password recovery in under 30 seconds.
              </p>
              <div className="space-y-1.5 text-[11px] text-slate-700 font-medium">
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Real SMS delivery to user mobile</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>6-12 Char Unique Login IDs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Manager & Floor Staff Roles</span>
                </div>
              </div>
            </div>

            {/* Feature 2: Double-Entry Stock Movement Ledger */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">2. Double-Entry Stock Ledger</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Inventory items never vanish or appear from void. Every single transaction specifies an explicit <b>Source Location</b> and <b>Destination Location</b>, providing mathematically balanced, audit-proof tracking across all hubs.
              </p>
              <div className="space-y-1.5 text-[11px] text-slate-700 font-medium">
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span>Zero phantom stock or shrinkage loss</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span>Source to Destination cryptographic trace</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span>Physical & Virtual balance reconciliation</span>
                </div>
              </div>
            </div>

            {/* Feature 3: Live Barcode & QR Scanner */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/20 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <ScanBarcode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">3. Hardware & Camera Barcode Scanner</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Turn your phone, tablet, or laptop camera into an instant optical reader. Supports physical laser barcode guns with continuous keystroke capture for zero-latency SKU lookups on the warehouse floor.
              </p>
              <div className="space-y-1.5 text-[11px] text-slate-700 font-medium">
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Live camera feed video stream decoding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Instant product details & rack locations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-cyan-600" />
                  <span>One-tap rapid stock transfer initiation</span>
                </div>
              </div>
            </div>

            {/* Feature 4: AI Predictive Forecasting & Copilot */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/20 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">4. AI Predictive Forecasting</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Analyzes consumption velocity and projects stockout dates before warehouses run dry. Generates automated purchase suggestions against min/max safety rules, with an interactive conversational AI Copilot.
              </p>
              <div className="space-y-1.5 text-[11px] text-slate-700 font-medium">
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  <span>Days-to-exhaustion burn rate telemetry</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  <span>Automated safety stock reorder quantity</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  <span>Optional Google Gemini LLM reasoning hook</span>
                </div>
              </div>
            </div>

            {/* Feature 5: Inbound Receipts & Outbound Deliveries */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/20 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <ArrowDownToLine className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">5. End-to-End Stock Operations</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Execute structured stock workflows: Supplier Receipts (vendor to warehouse putaway), Customer Deliveries (dispatch bay picking and shipping), and cycle-count Adjustments with automatic variance records.
              </p>
              <div className="space-y-1.5 text-[11px] text-slate-700 font-medium">
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                  <span>Draft, Ready, and Done validation phases</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                  <span>Supplier traceability & customer bill of lading</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                  <span>Inventory scrap & loss virtual accounts</span>
                </div>
              </div>
            </div>

            {/* Feature 6: Multi-Warehouse Network */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Warehouse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">6. Multi-Warehouse Hubs</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Scale across multiple physical sites: Main Manufacturing Warehouse (WH1), Central Distribution Depot (WH2), and internal zones (Main Store, Production Racks, Fast-Pick bays) with location heatmaps.
              </p>
              <div className="space-y-1.5 text-[11px] text-slate-700 font-medium">
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bin-level capacity utilization meters</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>Internal hub-to-hub transfers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>Multi-location stock balance cards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 4. SYSTEM SPECIFICATIONS & WIREFRAME SHOWCASE ---------------- */}
      <section id="wireframe-specs-section" className="py-16 bg-slate-100/70 border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold mb-3 shadow-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Implemented to Exact Diagram Specifications</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              StockSense Authentication System Blueprint
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Clean side-by-side implementation of your login and signup wireframes with live OTP verification.
            </p>
          </div>

          {/* Side-by-side Blueprint Cards in Light Theme */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left: Login Wireframe Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/30 shadow-md relative flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Login Module</h3>
                    <p className="text-xs text-slate-500">Credential & Phone Number Verification</p>
                  </div>
                </div>

                {/* Wireframe Mockup in Light Theme */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6 space-y-3 font-mono text-xs">
                  <div className="text-center pb-2 border-b border-slate-200">
                    <span className="text-[10px] text-emerald-700 uppercase tracking-widest font-sans font-bold">
                      [ StockSense Brand Logo ]
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-slate-600">
                    <span>Login Id / Phone Number</span>
                    <span className="text-[10px] text-emerald-600 font-sans font-bold">Required</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-slate-600">
                    <span>Password</span>
                    <span className="text-[10px] text-emerald-600 font-sans">••••••••</span>
                  </div>
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl text-center font-bold font-sans shadow-xs">
                    SIGN IN
                  </div>
                  <div className="flex justify-between text-[11px] font-sans text-slate-500 pt-1">
                    <span className="text-emerald-700 font-medium">Forget Password ?</span>
                    <span>|</span>
                    <span className="text-slate-800 font-bold">Sign Up</span>
                  </div>
                </div>

                {/* Logic List */}
                <div className="space-y-2 text-xs text-slate-700">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                    Enforced Logic:
                  </h4>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Check for registered Login ID or valid Phone Number.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Match credentials against system database to authorize access.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>
                      If credentials do not match, triggers exact error message: <br />
                      <code className="text-rose-700 font-mono bg-rose-50 px-1 py-0.5 rounded border border-rose-200 text-[11px]">
                        "Invalid Login Id or Password"
                      </code>
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Direct links to SignUp page and Forget Password page.</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => scrollToAuthSection('login')}
                  className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-emerald-200"
                >
                  Test Login Form &rarr;
                </button>
              </div>
            </div>

            {/* Right: Sign Up Wireframe Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-teal-500/30 shadow-md relative flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Sign Up Module</h3>
                    <p className="text-xs text-slate-500">Live Verix OTP Verification & Database Creation</p>
                  </div>
                </div>

                {/* Wireframe Mockup in Light Theme */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6 space-y-2 font-mono text-xs">
                  <div className="text-center pb-1 border-b border-slate-200">
                    <span className="text-[10px] text-teal-700 uppercase tracking-widest font-sans font-bold">
                      [ StockSense Brand Logo ]
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600">
                    Enter Login Id (6-12 chars, unique)
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600">
                    Enter Email Id (no duplicates)
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 flex justify-between">
                    <span>Enter Phone Number</span>
                    <span className="text-emerald-700 font-bold">[Live Verix OTP]</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600">
                    Enter Password (&gt;8 chars, upper, lower, special)
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600">
                    Re-Enter Password (must match)
                  </div>
                  <div className="p-2.5 bg-teal-600 text-white rounded-xl text-center font-bold font-sans shadow-xs">
                    SIGN UP
                  </div>
                </div>

                {/* Validation Checks */}
                <div className="space-y-2 text-xs text-slate-700">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                    Exact Validation Checks:
                  </h4>
                  <div className="flex items-start space-x-2">
                    <span className="text-teal-700 font-bold">1.</span>
                    <span>
                      <b>Login ID:</b> Must be unique and in between 6-12 characters long.
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-teal-700 font-bold">2.</span>
                    <span>
                      <b>Email ID:</b> Must not be a duplicate in the system database.
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-teal-700 font-bold">3.</span>
                    <span>
                      <b>Phone OTP:</b> Verified in real-time via live Verix Gateway API.
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-teal-700 font-bold">4.</span>
                    <span>
                      <b>Password:</b> Must contain lowercase, uppercase, special character, and length &gt; 8 characters.
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => scrollToAuthSection('signup')}
                  className="w-full py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-teal-200"
                >
                  Test Sign Up Form &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 5. INTERACTIVE LIVE FEATURE PREVIEW ---------------- */}
      <section className="py-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Interactive System Explorer
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select an operational pillar below to preview StockSense in action.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setActiveFeatureTab('otp')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeFeatureTab === 'otp'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                1. Verix Live OTP
              </button>
              <button
                onClick={() => setActiveFeatureTab('ledger')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeFeatureTab === 'ledger'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                2. Double-Entry Ledger
              </button>
              <button
                onClick={() => setActiveFeatureTab('scanner')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeFeatureTab === 'scanner'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                3. Barcode Scanner
              </button>
              <button
                onClick={() => setActiveFeatureTab('ai')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeFeatureTab === 'ai'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                4. AI Forecast & Copilot
              </button>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            {activeFeatureTab === 'otp' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">Live Verix SMS OTP Pipeline</span>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-mono bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                    vx_live Active
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <p className="font-bold text-slate-900 mb-1">Step 1: Enter Phone</p>
                    <p className="text-slate-500 text-[11px]">User inputs phone number & requests live SMS verification code.</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <p className="font-bold text-emerald-700 mb-1">Step 2: Instant Verix SMS</p>
                    <p className="text-slate-500 text-[11px]">Real SMS is delivered through Verix Gateway directly to handset.</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <p className="font-bold text-slate-900 mb-1">Step 3: Instant Access</p>
                    <p className="text-slate-500 text-[11px]">User is authenticated and authorized in the StockSense database.</p>
                  </div>
                </div>
                <div className="pt-2 text-center">
                  <button
                    onClick={() => scrollToAuthSection('signup')}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Test Live OTP Registration Now &rarr;
                  </button>
                </div>
              </div>
            )}

            {activeFeatureTab === 'ledger' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-teal-600" />
                    <span className="font-bold text-slate-900 text-sm">Stock Ledger Movement Records</span>
                  </div>
                  <span className="text-[10px] text-teal-800 font-mono bg-teal-100 px-2.5 py-0.5 rounded-full font-bold">
                    Double-Entry Verified
                  </span>
                </div>
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 p-2">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase">
                        <th className="py-2 px-3">Reference</th>
                        <th className="py-2 px-3">Product</th>
                        <th className="py-2 px-3">Source Location</th>
                        <th className="py-2 px-3">Destination Location</th>
                        <th className="py-2 px-3">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      <tr>
                        <td className="py-2.5 px-3 text-teal-700 font-bold">WH/IN/0001</td>
                        <td className="px-3 text-slate-900 font-sans font-medium">Steel Rods (10mm)</td>
                        <td className="px-3 text-slate-500">Vendors / Suppliers</td>
                        <td className="px-3 text-emerald-700 font-semibold">WH1 / Main Store</td>
                        <td className="px-3 font-bold text-slate-900">+50 kg</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-teal-700 font-bold">WH/INT/0002</td>
                        <td className="px-3 text-slate-900 font-sans font-medium">Industrial Bearings</td>
                        <td className="px-3 text-amber-700 font-semibold">WH1 / Rack A</td>
                        <td className="px-3 text-emerald-700 font-semibold">WH1 / Production Rack</td>
                        <td className="px-3 font-bold text-slate-900">20 Units</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeFeatureTab === 'scanner' && (
              <div className="space-y-3 text-center py-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <ScanBarcode className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Live Camera Barcode Scanner</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Scan physical barcodes like <code className="text-cyan-800 font-mono bg-cyan-50 px-1 py-0.5 rounded border border-cyan-200">STL-ROD-010</code> to pull up instant bin locations and initiate one-click transfers.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onGoToDashboard}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                  >
                    Open Barcode Scanner in Dashboard &rarr;
                  </button>
                </div>
              </div>
            )}

            {activeFeatureTab === 'ai' && (
              <div className="space-y-3 py-2">
                <div className="flex items-center space-x-2 text-purple-700 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Predictive Stockout Forecasting Engine</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs">
                  <div className="flex items-center justify-between text-slate-900 font-semibold mb-1">
                    <span>Ergonomic Desk Chairs (OFC-CHR-004)</span>
                    <span className="text-rose-600 font-mono font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Risk: Critical (2 Days)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-2">
                    Current stock (4 Units) is below minimum safety threshold (8 Units). Predicted to exhaust in 48 hours.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                    <span className="text-purple-700 font-mono font-bold">Recommended Reorder: +20 Units</span>
                    <span className="text-slate-500">Autonomous Calculation</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- 6. DIRECT PORTAL ACCESS SECTION (TAKE USER LOGIN) ---------------- */}
      <section id="auth-portal-section" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Interactive Login & Signup Gateway</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            Sign In to StockSense
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Use your Phone Number and Password to access your warehouse inventory operations.
          </p>
        </div>

        {/* Embedded Auth Card in Light Theme */}
        <div className="relative max-w-md mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-lg opacity-15" />
          <div className="relative">
            <AuthCard
              initialMode={authViewTab}
              onSuccess={onGoToDashboard}
              isModal={false}
            />
          </div>
        </div>
      </section>

      {/* ---------------- 7. LIGHT THEME FOOTER ---------------- */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-4 sm:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <StockSenseLogo size="sm" theme="light" showSubtitle={false} />
            <span className="text-xs text-slate-500">
              © {new Date().getFullYear()} StockSense Intelligent Inventory Systems. All rights reserved.
            </span>
          </div>

          <div className="flex items-center space-x-5 text-xs text-slate-600 font-medium">
            <button onClick={() => scrollToAuthSection('login')} className="hover:text-emerald-600 transition-colors cursor-pointer">
              Sign In
            </button>
            <button onClick={() => scrollToAuthSection('signup')} className="hover:text-emerald-600 transition-colors cursor-pointer">
              Register (Phone OTP)
            </button>
            <button onClick={() => scrollToAuthSection('forgot_password')} className="hover:text-emerald-600 transition-colors cursor-pointer">
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
