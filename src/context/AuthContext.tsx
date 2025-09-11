import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase'; // Assuming my supabase setup is in src/lib

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

  const { data: authListener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      // Only log important events to reduce console noise
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Force clear state on sign out
      if (event === 'SIGNED_OUT') {
        console.log('Force clearing auth state on sign out');
        setSession(null);
        setUser(null);
      }
    }
  );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    session,
    user,
    loading,
  }), [session, user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};