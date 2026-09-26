import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  User as UserIcon, 
  Mail, 
  Phone, 
  KeyRound, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  AlertCircle,
  Copy,
  Smartphone,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { StockSenseLogo } from '../common/StockSenseLogo';

interface AuthCardProps {
  initialMode?: 'login' | 'signup' | 'forgot_password';
  onSuccess?: () => void;
  isModal?: boolean;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  initialMode = 'login',
  onSuccess,
  isModal = false,
}) => {
  const {
    login,
    signup,
    sendSignupPhoneOTP,
    verifySignupPhoneOTP,
    sendForgotPasswordOTP,
    resetPasswordWithPhoneOTP,
    checkLoginIdAvailability,
    checkEmailAvailability,
    checkPhoneAvailability,
    validatePasswordRules,
    latestOtpInfo,
    clearOtpInfo,
    userDatabase,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>(initialMode);

  // Common UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Login ID or Phone Number
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form State
  const [signupLoginId, setSignupLoginId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupRole, setSignupRole] = useState<Role>('inventory_manager');

  // Sign Up OTP State
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupOtpCode, setSignupOtpCode] = useState('');
  const [signupPhoneVerified, setSignupPhoneVerified] = useState(false);
  const [signupOtpCooldown, setSignupOtpCooldown] = useState(0);

  // Forgot Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotTargetPhone, setForgotTargetPhone] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotOtpCooldown, setForgotOtpCooldown] = useState(0);

  // Timer cooldown effect
  useEffect(() => {
    let timer: any;
    if (signupOtpCooldown > 0) {
      timer = setInterval(() => setSignupOtpCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [signupOtpCooldown]);

  useEffect(() => {
    let timer: any;
    if (forgotOtpCooldown > 0) {
      timer = setInterval(() => setForgotOtpCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [forgotOtpCooldown]);

  // Real-time validations
  const passwordRules = validatePasswordRules(mode === 'signup' ? signupPassword : forgotNewPassword);
  const passwordsMatch = mode === 'signup' 
    ? signupPassword.length > 0 && signupPassword === signupConfirmPassword
    : forgotNewPassword.length > 0 && forgotNewPassword === forgotConfirmPassword;

  // Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setStatusMessage({ type: 'error', text: 'Invalid Login Id or Password' });
      return;
    }

    const result = login(loginIdentifier, loginPassword);
    if (result.success) {
      setStatusMessage({ type: 'success', text: 'Signed in successfully! Redirecting...' });
      if (onSuccess) onSuccess();
    } else {
      // Exactly "Invalid Login Id or Password" as specified in image notes
      setStatusMessage({ type: 'error', text: result.error || 'Invalid Login Id or Password' });
    }
  };

  // Handle Send Sign Up OTP via Verix Live API
  const handleSendSignupOTP = async () => {
    setStatusMessage(null);
    const phoneCheck = checkPhoneAvailability(signupPhone);
    if (!phoneCheck.valid) {
      setStatusMessage({ type: 'error', text: phoneCheck.error || 'Invalid phone number.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendSignupPhoneOTP(signupPhone);
      if (res.success) {
        setSignupOtpSent(true);
        setSignupOtpCooldown(30);
        setStatusMessage({
          type: 'info',
          text: `Live OTP dispatched via Verix to ${signupPhone}! Please check your SMS.`,
        });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verify Sign Up OTP via Verix Live API
  const handleVerifySignupOTP = async () => {
    setStatusMessage(null);
    if (!signupOtpCode.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter the 6-digit OTP code.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifySignupPhoneOTP(signupPhone, signupOtpCode);
      if (res.success) {
        setSignupPhoneVerified(true);
        setStatusMessage({ type: 'success', text: res.message });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up Submission
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // 1. Login ID rule check: 6-12 chars, unique
    const loginIdCheck = checkLoginIdAvailability(signupLoginId);
    if (!loginIdCheck.valid) {
      setStatusMessage({ type: 'error', text: loginIdCheck.error || 'Invalid Login ID' });
      return;
    }

    // 2. Email ID rule check: unique in db
    const emailCheck = checkEmailAvailability(signupEmail);
    if (!emailCheck.valid) {
      setStatusMessage({ type: 'error', text: emailCheck.error || 'Invalid Email ID' });
      return;
    }

    // 3. Phone check & verification
    if (!signupPhoneVerified) {
      setStatusMessage({
        type: 'error',
        text: 'Please verify your phone number via 6-digit OTP before completing registration.',
      });
      return;
    }

    // 4. Password rule check: >8 chars, lowercase, uppercase, special character
    if (!passwordRules.isValid) {
      setStatusMessage({
        type: 'error',
        text: 'Password does not meet requirements. Length must be > 8 characters, contain a lowercase, uppercase, and special character.',
      });
      return;
    }

    // 5. Re-Enter Password match check
    if (signupPassword !== signupConfirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match. Please re-enter carefully.' });
      return;
    }

    // Execute sign up
    const res = signup({
      loginId: signupLoginId,
      email: signupEmail,
      phoneNumber: signupPhone,
      password: signupPassword,
      name: signupName,
      role: signupRole,
    });

    if (res.success) {
      setStatusMessage({ type: 'success', text: 'Account registered successfully in StockSense database!' });
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 500);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Registration failed.' });
    }
  };

  // Handle Forgot Password - Send OTP via Verix
  const handleForgotSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    if (!forgotIdentifier.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your registered phone number or Login ID.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendForgotPasswordOTP(forgotIdentifier);
      if (res.success && res.phoneNumber) {
        setForgotOtpSent(true);
        setForgotTargetPhone(res.phoneNumber);
        setForgotOtpCooldown(30);
        setStatusMessage({ type: 'info', text: res.message });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password - Reset with OTP via Verix
  const handleForgotResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!forgotOtpCode.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter the 6-digit OTP code.' });
      return;
    }

    if (!passwordRules.isValid) {
      setStatusMessage({
        type: 'error',
        text: 'New password must have length > 8, a small case, a large case, and a special character.',
      });
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordWithPhoneOTP(forgotTargetPhone, forgotOtpCode, forgotNewPassword);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setLoginIdentifier(forgotTargetPhone);
        setLoginPassword(forgotNewPassword);
        setTimeout(() => {
          setMode('login');
          setForgotOtpSent(false);
          setForgotOtpCode('');
          setForgotNewPassword('');
          setForgotConfirmPassword('');
        }, 1500);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to prefill demo user
  const handleQuickFill = (user: typeof userDatabase[0]) => {
    setLoginIdentifier(user.loginId);
    setLoginPassword(user.password);
    setStatusMessage({
      type: 'info',
      text: `Loaded demo credentials for ${user.name} (${user.role.replace('_', ' ')}). Click 'SIGN IN'.`,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Realtime Verix Live OTP Gateway Session Banner */}
      {latestOtpInfo && (
        <div className="mb-4 bg-emerald-50 text-emerald-950 p-3.5 rounded-2xl border border-emerald-300 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Verix Live OTP Gateway Active
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Target: <span className="font-semibold text-emerald-900 font-mono">{latestOtpInfo.phone}</span>
                </p>
              </div>
            </div>
            <button
              onClick={clearOtpInfo}
              className="text-emerald-500 hover:text-emerald-800 text-xs px-1"
            >
              ✕
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
            <span className="text-[11px] text-emerald-800">
              Session ID: <code className="font-mono font-bold">{latestOtpInfo.requestId.substring(0, 12)}...</code>
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              Please enter code sent to your phone
            </span>
          </div>
        </div>
      )}

      {/* Main Auth Container Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 transition-all">
        {/* Top Header: Brand App Logo Box (Directly matching sketch: "App Logo") */}
        <div className="flex flex-col items-center justify-center text-center pb-6 border-b border-slate-100">
          <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100 mb-3 shadow-inner">
            <StockSenseLogo size="md" showSubtitle={false} />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {mode === 'login' && 'Sign In to StockSense'}
            {mode === 'signup' && 'Create StockSense Account'}
            {mode === 'forgot_password' && 'Reset Password via OTP'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            {mode === 'login' && 'Enter your Login ID or registered Phone Number to access inventory.'}
            {mode === 'signup' && 'Register in the StockSense database with phone OTP verification.'}
            {mode === 'forgot_password' && 'Enter your phone number to receive a 6-digit recovery OTP.'}
          </p>

          {/* Quick Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl mt-4 w-full">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setStatusMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setStatusMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign Up (Phone OTP)
            </button>
          </div>
        </div>

        {/* Status / Error / Success Alert */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-start space-x-2 ${
              statusMessage.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}
          >
            {statusMessage.type === 'error' ? (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* ----------------- 1. LOGIN PAGE VIEW (Matching sketch) ----------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
            {/* Login Id or Phone Number Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Login Id <span className="text-slate-400 font-normal">or Phone Number</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. manager_admin or 9876543210"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SIGN IN BUTTON (Sketch: "SIGN IN") */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all transform active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>SIGN IN</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Links at bottom: "Forget Password ? | Sign Up" */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('forgot_password');
                  setStatusMessage(null);
                }}
                className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                Forget Password ?
              </button>
              <div className="text-slate-300">|</div>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setStatusMessage(null);
                }}
                className="font-bold text-slate-900 hover:text-emerald-600 hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </div>

          </form>
        )}

        {/* ----------------- 2. SIGN UP PAGE VIEW (Matching sketch) ----------------- */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="mt-5 space-y-3.5">
            {/* Enter Login Id (Rule 1: 6-12 characters, unique) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Enter Login Id</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {signupLoginId.length}/12 chars (6-12)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. jaiswal_ops (6-12 chars)"
                  value={signupLoginId}
                  onChange={e => setSignupLoginId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  maxLength={12}
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>
              {signupLoginId.length > 0 && signupLoginId.length < 6 && (
                <p className="text-[10px] text-amber-600 mt-1">Must be at least 6 characters.</p>
              )}
            </div>

            {/* Enter Email Id (Rule 2: not duplicate in database) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Enter Email Id</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={signupEmail}
                  onChange={e => setSignupEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Enter Phone Number & Verix Live OTP */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter Phone Number <span className="text-emerald-600">* Live Verix OTP</span>
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    disabled={signupPhoneVerified}
                    placeholder="e.g. 9876543210"
                    value={signupPhone}
                    onChange={e => setSignupPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <button
                  type="button"
                  disabled={signupPhoneVerified || signupOtpCooldown > 0 || isLoading}
                  onClick={handleSendSignupOTP}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer flex items-center space-x-1 ${
                    signupPhoneVerified
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : signupOtpCooldown > 0
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : signupPhoneVerified ? (
                    <span className="flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Verified</span>
                    </span>
                  ) : signupOtpCooldown > 0 ? (
                    <span>Wait {signupOtpCooldown}s</span>
                  ) : signupOtpSent ? (
                    <span>Resend OTP</span>
                  ) : (
                    <span>Send OTP</span>
                  )}
                </button>
              </div>

              {/* OTP Input Row if OTP Sent */}
              {signupOtpSent && !signupPhoneVerified && (
                <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl animate-in fade-in duration-200">
                  <p className="text-[11px] font-semibold text-emerald-950 mb-1.5 flex items-center justify-between">
                    <span>Enter 6-digit Verix SMS Code:</span>
                    <span className="text-[10px] text-emerald-700 font-medium">Valid for 5 mins</span>
                  </p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 483921"
                      value={signupOtpCode}
                      onChange={e => setSignupOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="flex-1 px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono text-center tracking-widest font-bold"
                    />
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleVerifySignupOTP}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center space-x-1"
                    >
                      {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>Verify</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Enter Password (Rule 3: >8 chars, lower, upper, special) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Enter Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 9 chars with Upper, Lower & Symbol"
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Requirement Checklist */}
              <div className="mt-2 grid grid-cols-2 gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[10px]">
                <div className={`flex items-center space-x-1.5 ${passwordRules.hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  {passwordRules.hasMinLength ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                  <span>&gt; 8 Characters ({signupPassword.length}/9)</span>
                </div>
                <div className={`flex items-center space-x-1.5 ${passwordRules.hasLowerCase ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  {passwordRules.hasLowerCase ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                  <span>Lowercase [a-z]</span>
                </div>
                <div className={`flex items-center space-x-1.5 ${passwordRules.hasUpperCase ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  {passwordRules.hasUpperCase ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                  <span>Uppercase [A-Z]</span>
                </div>
                <div className={`flex items-center space-x-1.5 ${passwordRules.hasSpecialChar ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  {passwordRules.hasSpecialChar ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                  <span>Special Char (!@#$%)</span>
                </div>
              </div>
            </div>

            {/* Re-Enter Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Re-Enter Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat exact password"
                  value={signupConfirmPassword}
                  onChange={e => setSignupConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {signupConfirmPassword && !passwordsMatch && (
                <p className="text-[10px] text-rose-600 mt-1">Passwords do not match.</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role</label>
              <select
                value={signupRole}
                onChange={e => setSignupRole(e.target.value as Role)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="inventory_manager">Inventory Manager (Full Oversight & Valuations)</option>
                <option value="warehouse_staff">Warehouse Staff (Floor Moves & Scans)</option>
              </select>
            </div>

            {/* SIGN UP BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all transform active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>SIGN UP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 text-center text-xs">
              <span className="text-slate-500">Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setStatusMessage(null);
                }}
                className="font-bold text-emerald-600 hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ----------------- 3. FORGOT PASSWORD VIEW (Live Phone OTP) ----------------- */}
        {mode === 'forgot_password' && (
          <div className="mt-5 space-y-4">
            {!forgotOtpSent ? (
              <form onSubmit={handleForgotSendOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Registered Phone Number <span className="text-slate-400 font-normal">or Login ID</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543210 or manager_admin"
                      value={forgotIdentifier}
                      onChange={e => setForgotIdentifier(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    We will send a live 6-digit Verix OTP verification code to your registered mobile device.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                  <span>Send Recovery Phone OTP</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotResetSubmit} className="space-y-3.5">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                  <span>OTP dispatched to: <b className="font-mono">{forgotTargetPhone}</b></span>
                  {forgotOtpCooldown > 0 && (
                    <span className="text-[10px] text-emerald-700 font-mono">({forgotOtpCooldown}s)</span>
                  )}
                </div>

                {/* 6-digit OTP Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter 6-Digit Phone OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 483921"
                    value={forgotOtpCode}
                    onChange={e => setForgotOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-center tracking-widest font-extrabold focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 9 chars with Upper, Lower & Symbol"
                    value={forgotNewPassword}
                    onChange={e => setForgotNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                  {/* Password rules indicators */}
                  <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
                    <span className={passwordRules.hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                      • &gt;8 Characters
                    </span>
                    <span className={passwordRules.hasLowerCase ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                      • Lowercase [a-z]
                    </span>
                    <span className={passwordRules.hasUpperCase ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                      • Uppercase [A-Z]
                    </span>
                    <span className={passwordRules.hasSpecialChar ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                      • Special Char
                    </span>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Re-Enter New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={forgotConfirmPassword}
                    onChange={e => setForgotConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Verify OTP & Reset Password</span>
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-slate-100 text-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setForgotOtpSent(false);
                  setStatusMessage(null);
                }}
                className="font-bold text-emerald-600 hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
