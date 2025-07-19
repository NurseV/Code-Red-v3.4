

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role, SecurityRole } from '../types';
import * as api from '../services/api';
import { MOCK_SECURITY_ROLES } from '../constants';

interface InternalAuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userRole: SecurityRole | null;
  login: (username: string) => Promise<boolean>;
  logout: () => void;
}

const InternalAuthContext = createContext<InternalAuthContextType | undefined>(undefined);

export const InternalAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<SecurityRole | null>(null);

  const login = async (username: string): Promise<boolean> => {
    const loggedInUser = await api.loginInternalUser(username);
    if (loggedInUser) {
        setUser(loggedInUser);
        const roleDetails = MOCK_SECURITY_ROLES.find(r => r.name === loggedInUser.role);
        setUserRole(roleDetails || null);
        return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
  };

  const value = {
    isAuthenticated: !!user,
    user,
    userRole,
    login,
    logout,
  };

  return <InternalAuthContext.Provider value={value}>{children}</InternalAuthContext.Provider>;
};

export const useInternalAuth = (): InternalAuthContextType => {
  const context = useContext(InternalAuthContext);
  if (context === undefined) {
    throw new Error('useInternalAuth must be used within an InternalAuthProvider');
  }
  return context;
};
