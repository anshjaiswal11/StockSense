import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, role?: Role) => boolean;
  signup: (name: string, email: string, role: Role) => boolean;
  logout: () => void;
  switchRole: (role: Role) => void;
  sendPasswordResetOTP: (email: string) => { success: boolean; otp?: string; message: string };
  verifyOTPAndResetPassword: (email: string, otp: string, newPass: string) => boolean;
}

const DEFAULT_USER: User = {
  id: 'usr-1',
  name: 'Ansh Jaiswal',
  email: 'ansh.jaiswal@stocksense.io',
  role: 'inventory_manager',
  avatar: 'AJ',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('stocksense_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [simulatedOTP, setSimulatedOTP] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('stocksense_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('stocksense_user');
    }
  }, [currentUser]);

  const login = (email: string, role?: Role): boolean => {
    const assignedRole = role || (email.toLowerCase().includes('staff') ? 'warehouse_staff' : 'inventory_manager');
    const user: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      role: assignedRole,
      avatar: email.substring(0, 2).toUpperCase(),
    };
    setCurrentUser(user);
    return true;
  };

  const signup = (name: string, email: string, role: Role): boolean => {
    const user: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
    };
    setCurrentUser(user);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (newRole: Role) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: newRole,
      });
    }
  };

  const sendPasswordResetOTP = (email: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOTP(code);
    return {
      success: true,
      otp: code,
      message: `A verification OTP has been generated for ${email}. (Demo OTP: ${code})`,
    };
  };

  const verifyOTPAndResetPassword = (email: string, otp: string, _newPass: string) => {
    if (simulatedOTP && otp === simulatedOTP) {
      setSimulatedOTP(null);
      return true;
    }
    // allow bypass code 123456 in demo
    if (otp === '123456') {
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        signup,
        logout,
        switchRole,
        sendPasswordResetOTP,
        verifyOTPAndResetPassword,
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
