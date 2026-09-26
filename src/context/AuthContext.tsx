import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, UserAccount } from '../types';
import { sendVerixOtp, verifyVerixOtp, formatPhoneNumber } from '../services/verixOtpService';

export interface PasswordRulesValidation {
  hasMinLength: boolean; // > 8 characters
  hasLowerCase: boolean;
  hasUpperCase: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  userDatabase: UserAccount[];
  login: (identifier: string, password: string) => { success: boolean; error?: string };
  signup: (userData: {
    loginId: string;
    email: string;
    phoneNumber: string;
    password: string;
    name?: string;
    role: Role;
  }) => { success: boolean; error?: string };
  logout: () => void;
  switchRole: (role: Role) => void;
  sendSignupPhoneOTP: (phoneNumber: string) => Promise<{ success: boolean; requestId?: string; message: string }>;
  verifySignupPhoneOTP: (phoneNumber: string, otp: string) => Promise<{ success: boolean; message: string }>;
  sendForgotPasswordOTP: (identifier: string) => Promise<{ success: boolean; requestId?: string; phoneNumber?: string; message: string }>;
  resetPasswordWithPhoneOTP: (phoneNumber: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  checkLoginIdAvailability: (loginId: string) => { valid: boolean; error?: string };
  checkEmailAvailability: (email: string) => { valid: boolean; error?: string };
  checkPhoneAvailability: (phone: string) => { valid: boolean; error?: string };
  validatePasswordRules: (password: string) => PasswordRulesValidation;
  activeOtpRequestId: string | null;
  latestOtpInfo: { phone: string; requestId: string; message: string } | null;
  clearOtpInfo: () => void;
}

const SEED_USERS: UserAccount[] = [
  {
    id: 'usr-manager-1',
    loginId: 'manager_admin',
    email: 'manager@stocksense.io',
    phoneNumber: '+919876543210',
    name: 'Ansh Jaiswal',
    password: 'Password@123',
    role: 'inventory_manager',
    createdAt: '2026-01-15T09:00:00.000Z',
    phoneVerified: true,
  },
  {
    id: 'usr-staff-2',
    loginId: 'staff_ops',
    email: 'staff@stocksense.io',
    phoneNumber: '+919123456789',
    name: 'Vikram Singh',
    password: 'Password@123',
    role: 'warehouse_staff',
    createdAt: '2026-02-10T14:30:00.000Z',
    phoneVerified: true,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const validatePasswordRules = (password: string): PasswordRulesValidation => {
  const hasMinLength = password.length > 8; // sketch requirement: length should be more than 8 characters
  const hasLowerCase = /[a-z]/.test(password); // small case
  const hasUpperCase = /[A-Z]/.test(password); // large case
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password); // special character
  const isValid = hasMinLength && hasLowerCase && hasUpperCase && hasSpecialChar;

  return {
    hasMinLength,
    hasLowerCase,
    hasUpperCase,
    hasSpecialChar,
    isValid,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Persistent User Database
  const [userDatabase, setUserDatabase] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('stocksense_user_database');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user database', e);
      }
    }
    return SEED_USERS;
  });

  // 2. Persistent Active User
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('stocksense_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse active user', e);
      }
    }
    // Default to manager demo user
    const defaultAccount = SEED_USERS[0];
    return {
      id: defaultAccount.id,
      name: defaultAccount.name,
      email: defaultAccount.email,
      loginId: defaultAccount.loginId,
      phoneNumber: defaultAccount.phoneNumber,
      role: defaultAccount.role,
      avatar: 'AJ',
    };
  });

  // Track active Verix OTP request IDs mapped to phone numbers
  const [phoneRequestIds, setPhoneRequestIds] = useState<Record<string, string>>({}); // formattedPhone -> requestId
  const [activeOtpRequestId, setActiveOtpRequestId] = useState<string | null>(null);
  const [latestOtpInfo, setLatestOtpInfo] = useState<{
    phone: string;
    requestId: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem('stocksense_user_database', JSON.stringify(userDatabase));
  }, [userDatabase]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('stocksense_active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('stocksense_active_user');
    }
  }, [currentUser]);

  const clearOtpInfo = () => {
    setLatestOtpInfo(null);
  };

  // Field validation helpers
  const checkLoginIdAvailability = (loginId: string): { valid: boolean; error?: string } => {
    const clean = loginId.trim();
    if (!clean) {
      return { valid: false, error: 'Login ID is required.' };
    }
    if (clean.length < 6 || clean.length > 12) {
      return { valid: false, error: 'Login ID must be between 6 and 12 characters.' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      return { valid: false, error: 'Login ID can only contain letters, numbers, and underscores.' };
    }
    const exists = userDatabase.some(u => u.loginId.toLowerCase() === clean.toLowerCase());
    if (exists) {
      return { valid: false, error: 'This Login ID is already taken. Please choose another.' };
    }
    return { valid: true };
  };

  const checkEmailAvailability = (email: string): { valid: boolean; error?: string } => {
    const clean = email.trim().toLowerCase();
    if (!clean) {
      return { valid: false, error: 'Email ID is required.' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return { valid: false, error: 'Please enter a valid email address.' };
    }
    const exists = userDatabase.some(u => u.email.toLowerCase() === clean);
    if (exists) {
      return { valid: false, error: 'Email ID is already registered in the system.' };
    }
    return { valid: true };
  };

  const checkPhoneAvailability = (phone: string): { valid: boolean; error?: string } => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (!clean) {
      return { valid: false, error: 'Phone number is required.' };
    }
    if (clean.length < 10) {
      return { valid: false, error: 'Phone number must be at least 10 digits.' };
    }
    const formatted = formatPhoneNumber(phone);
    const exists = userDatabase.some(
      u => formatPhoneNumber(u.phoneNumber) === formatted || u.phoneNumber.replace(/[^0-9]/g, '') === clean
    );
    if (exists) {
      return { valid: false, error: 'Phone number is already associated with another account.' };
    }
    return { valid: true };
  };

  // Live Verix OTP Generation & Verification
  const sendSignupPhoneOTP = async (phoneNumber: string) => {
    const clean = phoneNumber.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit phone number first.' };
    }

    const formatted = formatPhoneNumber(phoneNumber);
    const res = await sendVerixOtp(formatted);

    if (res.success && res.requestId) {
      setPhoneRequestIds(prev => ({ ...prev, [formatted]: res.requestId! }));
      setActiveOtpRequestId(res.requestId);
      setLatestOtpInfo({
        phone: formatted,
        requestId: res.requestId,
        message: res.message,
      });

      return {
        success: true,
        requestId: res.requestId,
        message: `Live Verix OTP sent to ${formatted}! (Session: ${res.requestId.substring(0, 8)}...)`,
      };
    }

    return {
      success: false,
      message: res.message || 'Failed to dispatch OTP via Verix Gateway.',
    };
  };

  const verifySignupPhoneOTP = async (
    phoneNumber: string,
    otp: string
  ): Promise<{ success: boolean; message: string }> => {
    const formatted = formatPhoneNumber(phoneNumber);
    const requestId = phoneRequestIds[formatted] || activeOtpRequestId;

    // Call live Verix verification endpoint
    const res = await verifyVerixOtp(requestId || '', otp);
    return res;
  };

  const sendForgotPasswordOTP = async (identifier: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[^0-9]/g, '');

    // Search user by Phone Number OR Login ID OR Email
    const user = userDatabase.find(
      u =>
        u.phoneNumber.replace(/[^0-9]/g, '') === cleanPhone ||
        formatPhoneNumber(u.phoneNumber) === formatPhoneNumber(identifier) ||
        u.loginId.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    );

    if (!user) {
      return {
        success: false,
        message: 'No registered user found matching this Phone Number or Login ID.',
      };
    }

    const userPhone = formatPhoneNumber(user.phoneNumber);
    const res = await sendVerixOtp(userPhone);

    if (res.success && res.requestId) {
      setPhoneRequestIds(prev => ({ ...prev, [userPhone]: res.requestId! }));
      setActiveOtpRequestId(res.requestId);
      setLatestOtpInfo({
        phone: userPhone,
        requestId: res.requestId,
        message: res.message,
      });

      return {
        success: true,
        requestId: res.requestId,
        phoneNumber: userPhone,
        message: `Verix OTP sent to registered phone ${userPhone}.`,
      };
    }

    return {
      success: false,
      message: res.message || 'Failed to send reset OTP.',
    };
  };

  const resetPasswordWithPhoneOTP = async (
    phoneNumber: string,
    otp: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const userPhone = formatPhoneNumber(phoneNumber);
    const requestId = phoneRequestIds[userPhone] || activeOtpRequestId;

    const verifyRes = await verifyVerixOtp(requestId || '', otp);
    if (!verifyRes.success) {
      return { success: false, message: verifyRes.message };
    }

    const passValidation = validatePasswordRules(newPassword);
    if (!passValidation.isValid) {
      return {
        success: false,
        message: 'Password must have more than 8 characters, a lowercase letter, an uppercase letter, and a special character.',
      };
    }

    // Find and update user in database
    const userIndex = userDatabase.findIndex(
      u => formatPhoneNumber(u.phoneNumber) === userPhone || u.phoneNumber.replace(/[^0-9]/g, '') === userPhone.replace(/[^0-9]/g, '')
    );

    if (userIndex === -1) {
      return { success: false, message: 'Target user account could not be found.' };
    }

    const updatedDb = [...userDatabase];
    updatedDb[userIndex] = {
      ...updatedDb[userIndex],
      password: newPassword,
    };

    setUserDatabase(updatedDb);

    return {
      success: true,
      message: 'Password updated successfully in StockSense! You can now log in with your new password.',
    };
  };

  // Login: Match credentials by Login ID OR Phone Number (or Email) + Password
  const login = (identifier: string, password: string): { success: boolean; error?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[^0-9]/g, '');

    const user = userDatabase.find(u => {
      const matchesLoginId = u.loginId.toLowerCase() === cleanId;
      const matchesPhone = cleanPhone.length >= 10 && (
        u.phoneNumber.replace(/[^0-9]/g, '') === cleanPhone ||
        formatPhoneNumber(u.phoneNumber) === formatPhoneNumber(identifier)
      );
      const matchesEmail = u.email.toLowerCase() === cleanId;
      return matchesLoginId || matchesPhone || matchesEmail;
    });

    if (!user || user.password !== password) {
      // Exact error message requested in design notes: "Invalid Login Id or Password"
      return {
        success: false,
        error: 'Invalid Login Id or Password',
      };
    }

    const activeUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      loginId: user.loginId,
      phoneNumber: user.phoneNumber,
      role: user.role,
      avatar: user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || user.loginId.substring(0, 2).toUpperCase(),
    };

    setCurrentUser(activeUser);
    return { success: true };
  };

  // Sign Up: Register new user into database
  const signup = (userData: {
    loginId: string;
    email: string;
    phoneNumber: string;
    password: string;
    name?: string;
    role: Role;
  }): { success: boolean; error?: string } => {
    const loginIdCheck = checkLoginIdAvailability(userData.loginId);
    if (!loginIdCheck.valid) {
      return { success: false, error: loginIdCheck.error };
    }

    const emailCheck = checkEmailAvailability(userData.email);
    if (!emailCheck.valid) {
      return { success: false, error: emailCheck.error };
    }

    const phoneCheck = checkPhoneAvailability(userData.phoneNumber);
    if (!phoneCheck.valid) {
      return { success: false, error: phoneCheck.error };
    }

    const passCheck = validatePasswordRules(userData.password);
    if (!passCheck.isValid) {
      return {
        success: false,
        error: 'Password must have > 8 characters, a lowercase letter, an uppercase letter, and a special character.',
      };
    }

    const displayName =
      userData.name?.trim() ||
      userData.loginId
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    const newAccount: UserAccount = {
      id: `usr-${Date.now()}`,
      loginId: userData.loginId.trim(),
      email: userData.email.trim().toLowerCase(),
      phoneNumber: formatPhoneNumber(userData.phoneNumber.trim()),
      name: displayName,
      password: userData.password,
      role: userData.role,
      createdAt: new Date().toISOString(),
      phoneVerified: true,
    };

    setUserDatabase(prev => [...prev, newAccount]);

    const activeUser: User = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      loginId: newAccount.loginId,
      phoneNumber: newAccount.phoneNumber,
      role: newAccount.role,
      avatar: newAccount.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2),
    };

    setCurrentUser(activeUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (newRole: Role) => {
    if (currentUser) {
      const updated: User = {
        ...currentUser,
        role: newRole,
      };
      setCurrentUser(updated);

      setUserDatabase(prev =>
        prev.map(u => (u.id === currentUser.id ? { ...u, role: newRole } : u))
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        userDatabase,
        login,
        signup,
        logout,
        switchRole,
        sendSignupPhoneOTP,
        verifySignupPhoneOTP,
        sendForgotPasswordOTP,
        resetPasswordWithPhoneOTP,
        checkLoginIdAvailability,
        checkEmailAvailability,
        checkPhoneAvailability,
        validatePasswordRules,
        activeOtpRequestId,
        latestOtpInfo,
        clearOtpInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
