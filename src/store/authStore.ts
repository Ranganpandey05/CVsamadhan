import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// User profile type
interface UserProfile {
  id: string;
  role: 'worker' | 'citizen';
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  department?: string;
  speciality?: string;
  created_at: string;
  updated_at: string;
}

// Auth store interface
interface AuthStore {
  // Auth state
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  clearAllData: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  forceRefreshProfile: () => Promise<void>; // NEW: Force refresh without cache
}

// Create the auth store with persistence
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      session: null,
      user: null,
      profile: null,
      loading: true,
      isAuthenticated: false,

      // Set session and update authentication status
      setSession: (session: Session | null) => {
        console.log('AuthStore: Setting session', !!session);
        set({ 
          session, 
          user: session?.user || null,
          isAuthenticated: !!session 
        });
      },

      // Set user
      setUser: (user: User | null) => {
        console.log('AuthStore: Setting user', !!user);
        set({ user });
      },

      // Set profile
      setProfile: (profile: UserProfile | null) => {
        console.log('AuthStore: Setting profile', profile?.role);
        set({ profile });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ loading });
      },

      // Sign out and clear all data
      signOut: async () => {
        try {
          console.log('AuthStore: Starting sign out process...');
          
          // Sign out from Supabase first
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.error('AuthStore: Supabase sign out error:', error);
            // Still clear local state even if Supabase sign out fails
          }
          
          // Clear all local storage
          await get().clearAllData();
          
          // Clear Zustand state
          set({
            session: null,
            user: null,
            profile: null,
            isAuthenticated: false,
            loading: false
          });
          
          console.log('AuthStore: Sign out completed successfully');
          
          // Force navigation to welcome screen after state is cleared
          setTimeout(() => {
            try {
              // Try to import router dynamically to avoid circular imports
              const { router } = require('expo-router');
              console.log('AuthStore: Forcing navigation to welcome screen');
              
              // Ultra aggressive navigation attempts
              router.dismissAll();
              router.replace('/');
              
              setTimeout(() => {
                router.dismissAll();
                router.navigate('/');
              }, 30);
              
              setTimeout(() => {
                router.dismissAll();
                router.push('/');
              }, 60);
              
              setTimeout(() => {
                // Final attempt with a different method
                router.navigate('/', { replace: true });
                console.log('AuthStore: Final navigation attempt completed');
              }, 100);
              
            } catch (navError) {
              console.log('AuthStore: Router not available, navigation will be handled by layout');
            }
          }, 25);
          
        } catch (error) {
          console.error('AuthStore: Sign out error:', error);
          // Force clear state even on error
          set({
            session: null,
            user: null,
            profile: null,
            isAuthenticated: false,
            loading: false
          });
        }
      },

      // Clear all local data
      clearAllData: async () => {
        try {
          console.log('AuthStore: Clearing all local data...');
          
          // List of keys to clear
          const keysToRemove = [
            'auth-storage', // Zustand persistence key
            '@supabase/auth-token',
            '@supabase/auth-session',
            'user-profile',
            'worker-tasks',
            'citizen-reports',
            'app-settings',
            'language-preference'
          ];
          
          // Remove specific keys
          await AsyncStorage.multiRemove(keysToRemove);
          
          // Also clear all keys that start with our app prefix
          const allKeys = await AsyncStorage.getAllKeys();
          const appKeys = allKeys.filter(key => 
            key.startsWith('cvsamadhan-') || 
            key.startsWith('supabase-') ||
            key.includes('auth') ||
            key.includes('user') ||
            key.includes('worker') ||
            key.includes('citizen')
          );
          
          if (appKeys.length > 0) {
            await AsyncStorage.multiRemove(appKeys);
          }
          
          console.log('AuthStore: Local data cleared successfully');
        } catch (error) {
          console.error('AuthStore: Error clearing local data:', error);
        }
      },

      // Initialize authentication
      initializeAuth: async () => {
        try {
          console.log('AuthStore: Initializing authentication...');
          set({ loading: true });
          
          // Get current session from Supabase
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('AuthStore: Error getting session:', error);
            set({ loading: false });
            return;
          }
          
          if (session) {
            console.log('AuthStore: Session found, setting up user');
            set({ 
              session, 
              user: session.user,
              isAuthenticated: true 
            });
            
            // Refresh profile from cloud
            await get().refreshProfile();
          } else {
            console.log('AuthStore: No session found');
            set({ 
              session: null, 
              user: null, 
              profile: null,
              isAuthenticated: false 
            });
          }
          
          set({ loading: false });
        } catch (error) {
          console.error('AuthStore: Error initializing auth:', error);
          set({ loading: false });
        }
      },

      // Refresh profile from cloud
      refreshProfile: async () => {
        try {
          const { user } = get();
          if (!user) {
            console.log('AuthStore: No user to refresh profile for');
            return;
          }
          
          console.log('AuthStore: Refreshing profile from cloud for user:', user.id);
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('AuthStore: Error refreshing profile:', error);
            return;
          }
          
          if (profile) {
            console.log('AuthStore: Profile refreshed from cloud:', {
              role: profile.role,
              approval_status: profile.approval_status,
              email: profile.email,
              full_name: profile.full_name
            });
            set({ profile });
          } else {
            console.log('AuthStore: No profile found for user');
          }
        } catch (error) {
          console.error('AuthStore: Error refreshing profile:', error);
        }
      },

      // Force refresh profile from cloud (bypass any potential caching)
      forceRefreshProfile: async () => {
        try {
          const { user } = get();
          if (!user) {
            console.log('AuthStore: No user to force refresh profile for');
            return;
          }
          
          console.log('AuthStore: FORCE refreshing profile from cloud for user:', user.id);
          
          // Clear current profile first
          set({ profile: null });
          
          // Add cache-busting timestamp
          const timestamp = Date.now();
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('AuthStore: Error force refreshing profile:', error);
            return;
          }
          
          if (profile) {
            console.log('AuthStore: Profile FORCE refreshed:', {
              role: profile.role,
              approval_status: profile.approval_status,
              email: profile.email,
              full_name: profile.full_name,
              timestamp: timestamp
            });
            set({ profile });
          } else {
            console.log('AuthStore: No profile found during force refresh');
          }
        } catch (error) {
          console.error('AuthStore: Error force refreshing profile:', error);
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: async (name: string) => {
          try {
            const value = await AsyncStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch (error) {
            console.error('AuthStore: Error getting item from storage:', error);
            return null;
          }
        },
        setItem: async (name: string, value: any) => {
          try {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error('AuthStore: Error setting item to storage:', error);
          }
        },
        removeItem: async (name: string) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch (error) {
            console.error('AuthStore: Error removing item from storage:', error);
          }
        },
      },
      // Only persist essential auth data, not session (let Supabase handle that)
      partialize: (state) => ({
        profile: state.profile,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

// Set up Supabase auth listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('AuthStore: Supabase auth state changed:', event, !!session);
  
  const { setSession, setUser, setProfile, clearAllData, refreshProfile } = useAuthStore.getState();
  
  if (event === 'SIGNED_IN' && session) {
    console.log('AuthStore: User signed in, updating store');
    setSession(session);
    setUser(session.user);
    
    // Refresh profile from cloud on sign in
    refreshProfile();
  } else if (event === 'SIGNED_OUT') {
    console.log('AuthStore: User signed out, clearing store');
    setSession(null);
    setUser(null);
    setProfile(null);
    
    // Clear all local data on sign out
    clearAllData();
  } else if (event === 'TOKEN_REFRESHED' && session) {
    console.log('AuthStore: Token refreshed, updating session');
    setSession(session);
    setUser(session.user);
  }
});