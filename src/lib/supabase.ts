import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://zungdlmocuhesoshdwsp.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1bmdkbG1vY3VoZXNvc2hkd3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA2MDcsImV4cCI6MjA3MzAxNjYwN30.ilXPg2YqBCCPs6Bz1Bxgtn8EPflHqBeIUu0sT9GDesU";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Check your environment variables.");
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Debug: Log Supabase configuration
console.log('Supabase initialized with URL:', supabaseUrl);
console.log('Supabase client created successfully');

// Database Types
export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role: 'citizen' | 'worker' | 'admin';
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  issue_number: string;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Reported' | 'Acknowledged' | 'Assigned' | 'In Progress' | 'Completed' | 'Verified';
  latitude: number;
  longitude: number;
  address: string;
  citizen_id: string;
  citizen_name: string;
  citizen_phone: string;
  assigned_worker_id?: string;
  photos: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface Worker {
  id: string;
  worker_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  department?: string;
  status: 'available' | 'busy' | 'offline';
  current_latitude?: number;
  current_longitude?: number;
  created_at: string;
  profile_id: string;
}

export interface IssueUpvote {
  id: string;
  issue_id: string;
  user_id: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  issue_id: string;
  worker_id: string;
  assigned_by: string;
  assigned_at: string;
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed';
  notes?: string;
  completed_at?: string;
}

// Helper functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
};

export const createIssue = async (issueData: Partial<Issue>) => {
  const { data, error } = await supabase
    .from('issues')
    .insert(issueData)
    .select()
    .single();
  
  return { data, error };
};

export const getNearbyIssues = async (latitude: number, longitude: number, radiusKm: number = 2.5) => {
  // Calculate bounding box
  const latDelta = radiusKm / 111; // 1 degree latitude ≈ 111 km
  const lngDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));

  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      profiles!citizen_id (
        full_name,
        avatar_url
      )
    `)
    .gte('latitude', latitude - latDelta)
    .lte('latitude', latitude + latDelta)
    .gte('longitude', longitude - lngDelta)
    .lte('longitude', longitude + lngDelta)
    .order('created_at', { ascending: false });

  return { data, error };
};

export const getIssueUpvotes = async (issueId: string) => {
  const { count, error } = await supabase
    .from('issue_upvotes')
    .select('*', { count: 'exact' })
    .eq('issue_id', issueId);

  return { count: count || 0, error };
};

export const toggleUpvote = async (issueId: string, userId: string) => {
  // Check if user already upvoted
  const { data: existingUpvote, error: checkError } = await supabase
    .from('issue_upvotes')
    .select('id')
    .eq('issue_id', issueId)
    .eq('user_id', userId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    return { error: checkError };
  }

  if (existingUpvote) {
    // Remove upvote
    const { error } = await supabase
      .from('issue_upvotes')
      .delete()
      .eq('issue_id', issueId)
      .eq('user_id', userId);
    
    return { removed: true, error };
  } else {
    // Add upvote
    const { data, error } = await supabase
      .from('issue_upvotes')
      .insert({ issue_id: issueId, user_id: userId })
      .select()
      .single();
    
    return { data, error };
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('Connection test error:', error);
      return { success: false, error };
    } else {
      console.log('Connection test successful');
      return { success: true, data };
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error };
  }
};

// Authentication Functions
export const signOut = async () => {
  try {
    console.log('Starting sign out process...');
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      return { success: false, error };
    }
    
    console.log('Sign out successful');
    return { success: true };
  } catch (error) {
    console.error('Sign out exception:', error);
    return { success: false, error };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (error) {
    console.error('Sign in exception:', error);
    return { data: null, error };
  }
};

export const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  } catch (error) {
    console.error('Sign up exception:', error);
    return { data: null, error };
  }
};

export const resendConfirmation = async (email: string) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { error };
  } catch (error) {
    console.error('Resend confirmation exception:', error);
    return { error };
  }
};