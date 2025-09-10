// import 'react-native-url-polyfill/auto';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error("Supabase URL or Anon Key is missing. Check your .env file.");
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage: AsyncStorage,
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: false,
//   },
// });

// MY GUIDE :-

// Explanation of this file:

// react-native-url-polyfill/auto: This polyfill is needed because the Supabase client uses URL APIs that aren't fully available in the React Native environment.

// AsyncStorage: We're telling the Supabase client to use React Native's AsyncStorage to securely store user session information (like login tokens) on the device. This keeps the user logged in between app launches.

// process.env.EXPO_PUBLIC_...: We are securely loading the URL and key from the .env file you created.
// This polyfill is required to use the Supabase client in a React Native environment.
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://zungdlmocuhesoshdwsp.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1bmdkbG1vY3VoZXNvc2hkd3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA2MDcsImV4cCI6MjA3MzAxNjYwN30.ilXPg2YqBCCPs6Bz1Bxgtn8EPflHqBeIUu0sT9GDesU";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Check your environment variables.");
}

// Create a custom fetch function that handles React Native networking issues
const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  console.log('Making request to:', url);
  console.log('Request options:', init);
  
  try {
    const response = await fetch(input, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'supabase-js-react-native',
        ...init?.headers,
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'implicit',
  },
  global: {
    fetch: customFetch,
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Debug: Log Supabase configuration
console.log('Supabase initialized with URL:', supabaseUrl);
console.log('Supabase client created successfully');

// Test the connection
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('Connection test error:', error);
    } else {
      console.log('Connection test successful:', data);
    }
    return { data, error };
  } catch (err) {
    console.error('Connection test failed:', err);
    return { data: null, error: err };
  }
};

// Direct authentication functions to bypass Supabase client issues
export const directSignUp = async (email: string, password: string, metadata: any = {}) => {
  try {
    console.log('Direct sign up attempt...');
    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        data: metadata,
      }),
    });

    console.log('Direct signup response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Direct signup error response:', errorData);
      throw new Error(`Signup failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Direct signup success:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Direct signup error:', error);
    return { data: null, error };
  }
};

export const directSignIn = async (email: string, password: string) => {
  try {
    console.log('Direct sign in attempt...');
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    console.log('Direct signin response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Direct signin error response:', errorData);
      throw new Error(`Signin failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Direct signin success:', data);
    
    // Set the session in Supabase client
    if (data.access_token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      
      if (sessionError) {
        console.error('Error setting session:', sessionError);
        return { data: null, error: sessionError };
      }
      
      console.log('Session set successfully');
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Direct signin error:', error);
    return { data: null, error };
  }
};

export const resendConfirmation = async (email: string) => {
  try {
    console.log('Resending confirmation email...');
    const response = await fetch(`${supabaseUrl}/auth/v1/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        email,
        type: 'signup',
      }),
    });

    console.log('Resend confirmation response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend confirmation error response:', errorData);
      throw new Error(`Resend failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Resend confirmation success:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Resend confirmation error:', error);
    return { data: null, error };
  }
};

// Check if user's email is verified
export const checkEmailVerification = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return { verified: false, error };
    }
    
    const isVerified = user?.email_confirmed_at !== null;
    console.log('Email verification status:', isVerified);
    return { verified: isVerified, user, error: null };
  } catch (error) {
    console.error('Error checking email verification:', error);
    return { verified: false, error };
  }
};

// Sign out function
export const signOut = async () => {
  try {
    console.log('Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      return { error };
    }
    console.log('Sign out successful');
    
    // Force clear any cached session data
    try {
      await supabase.auth.getSession();
    } catch (e) {
      console.log('Session cleared');
    }
    
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};
