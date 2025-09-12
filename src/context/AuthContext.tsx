import React, { useEffect, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useAuthStore } from '../store/authStore';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  forceRefreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  forceRefreshProfile: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    session,
    user,
    profile,
    loading,
    isAuthenticated,
    signOut,
    refreshProfile,
    forceRefreshProfile,
    initializeAuth
  } = useAuthStore();

  useEffect(() => {
    // Initialize authentication when the app starts
    initializeAuth();
  }, []);

  const value = {
    session,
    user,
    profile,
    loading,
    isAuthenticated,
    signOut,
    refreshProfile,
    forceRefreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};