
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CitizenUser } from '../types';
import * as api from '../services/api';

interface CitizenAuthContextType {
  isAuthenticated: boolean;
  citizenUser: CitizenUser | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<{success: boolean, error: string | null}>;
}

const CitizenAuthContext = createContext<CitizenAuthContextType | undefined>(undefined);

export const CitizenAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [citizenUser, setCitizenUser] = useState<CitizenUser | null>(null);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { user, error } = await api.loginCitizenUser(email, password);
    if (user) {
        setCitizenUser(user);
    }
    return error;
  };

  const register = async (name: string, email: string, password: string) => {
    return await api.registerCitizen(name, email, password);
  };


  const logout = () => {
    setCitizenUser(null);
  };

  const value = {
    isAuthenticated: !!citizenUser,
    citizenUser,
    login,
    logout,
    register,
  };

  return <CitizenAuthContext.Provider value={value}>{children}</CitizenAuthContext.Provider>;
};

export const useCitizenAuth = (): CitizenAuthContextType => {
  const context = useContext(CitizenAuthContext);
  if (context === undefined) {
    throw new Error('useCitizenAuth must be used within an CitizenAuthProvider');
  }
  return context;
};
