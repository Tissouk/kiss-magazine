import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Helper functions for authentication
export const auth = {
  // Sign up with email
  signUp: async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  // Sign in with email
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign in with social providers
  signInWithProvider: async (provider: 'google' | 'github' | 'discord') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    return { data, error };
  }
};

// Helper functions for user management
export const userService = {
  // Get user profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_badges (*)
      `)
      .eq('id', userId)
      .single();
    
    return { data, error };
  },

  // Update user profile
  updateProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  },

  // Award points to user
  awardPoints: async (userId: string, points: number, action: string, description?: string, referenceId?: string) => {
    const { data, error } = await supabase.rpc('award_points', {
      user_uuid: userId,
      points_amount: points,
      transaction_action: action,
      transaction_description: description,
      reference_uuid: referenceId
    });
    
    return { data, error };
  },

  // Redeem points
  redeemPoints: async (userId: string, points: number, action: string, description?: string, referenceId?: string) => {
    const { data, error } = await supabase.rpc('redeem_points', {
      user_uuid: userId,
      points_amount: points,
      transaction_action: action,
      transaction_description: description,
      reference_uuid: referenceId
    });
    
    return { data, error };
  },

  // Get user level progress
  getLevelProgress: async (userId: string) => {
    const { data, error } = await supabase.rpc('get_user_level_progress', {
      user_uuid: userId
    });
    
    return { data: data?.[0], error };
  },

  // Get loyalty transactions
  getTransactions: async (userId: string, limit: number = 50) => {
    const { data, error } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { data, error };
  }
};