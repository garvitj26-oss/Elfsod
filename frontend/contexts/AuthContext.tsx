'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string, userType?: 'advertiser' | 'publisher') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isPublisher: boolean;
  isAdvertiser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch user profile from public.users table
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Only log error if it's not a "not found" error
        if (error.code !== 'PGRST116') {
          console.warn('⚠️ User profile table may not exist. Run auth_schema.sql in Supabase.');
          console.warn('Error details:', error.message);
        }
        return null;
      }

      return data as User;
    } catch (error) {
      console.warn('⚠️ Could not fetch user profile. This is normal if not signed in.');
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        
        // Get initial session from localStorage
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Error getting session:', sessionError);
        }

        if (currentSession) {
          console.log('✅ Found existing session:', currentSession.user.email);
        } else {
          console.log('ℹ️ No existing session found');
        }
        
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          console.log('👤 Fetching user profile...');
          const profile = await fetchUserProfile(currentSession.user.id);
          setUser(profile);
          console.log('✅ User profile loaded:', profile?.full_name);
        }

        setLoading(false);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('🔄 Auth state changed:', event, newSession?.user?.email || 'no user');
            setSession(newSession);
            setSupabaseUser(newSession?.user ?? null);

            if (newSession?.user) {
              const profile = await fetchUserProfile(newSession.user.id);
              setUser(profile);
            } else {
              setUser(null);
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting sign in...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error.message);
        return { error };
      }

      console.log('✅ Sign in successful:', data.user?.email);
      console.log('📦 Session stored in localStorage');

      if (data.user && data.session) {
        setSession(data.session);
        setSupabaseUser(data.user);
        
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);
        console.log('✅ User profile loaded:', profile?.full_name);
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected sign in error:', error);
      return { error: error as Error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    userType: 'advertiser' | 'publisher' = 'advertiser'
  ) => {
    try {
      console.log('📝 Attempting sign up...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType,
            phone: phone || '',
          },
        },
      });

      if (error) {
        console.error('❌ Sign up error:', error.message);
        return { error };
      }

      console.log('✅ Sign up successful:', data.user?.email);
      console.log('📦 Session created and stored');

      // Set session and user immediately
      if (data.user && data.session) {
        setSession(data.session);
        setSupabaseUser(data.user);
        console.log('✅ Session set in AuthContext');

        // Profile will be created automatically by the database trigger
        // Fetch it after a short delay
        setTimeout(async () => {
          const profile = await fetchUserProfile(data.user!.id);
          setUser(profile);
          console.log('✅ User profile loaded after signup:', profile?.full_name);
        }, 1500);
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected sign up error:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: user?.user_type === 'admin',
    isPublisher: user?.user_type === 'publisher',
    isAdvertiser: user?.user_type === 'advertiser',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

