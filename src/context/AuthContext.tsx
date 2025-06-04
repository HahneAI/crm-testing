import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { getSupabase } from '../services/supabase';
import { UserProfile } from '../types/user';

// Updated mock user profile to match new schema
const mockUserProfile: UserProfile = {
  id: 'user-1',
  email: 'admin@example.com',
  full_name: 'Admin User',
  role: 'admin',
  company_id: 'company-1',
  phone: '555-123-4567',
  is_active: true,
  created_at: '2023-06-01T00:00:00Z',
  updated_at: '2023-06-01T00:00:00Z'
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, full_name: string) => Promise<{ error: AuthError | null, data: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if Supabase is configured
  const supabaseConfigured = 
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== 'your-supabase-project-url';

  useEffect(() => {
    console.log('AuthContext Debug:', { 
      supabaseConfigured, 
      timestamp: new Date().toISOString() 
    });
    
    // Mock auth for development when Supabase isn't configured
    if (!supabaseConfigured) {
      // Simulate a brief loading state
      setTimeout(() => {
        setUser({ id: mockUserProfile.id } as User);
        setUserProfile(mockUserProfile);
        setIsAdmin(mockUserProfile.role === 'admin');
        setLoading(false);
      }, 1000);
      return;
    }

    // Real Supabase auth logic when configured
    const supabase = getSupabase();
    
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Session check result:', { session: session?.user?.id, error });
        
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseConfigured]);

  const fetchUserProfile = async (userId: string) => {
    if (!supabaseConfigured) {
      // Use mock data
      setUserProfile(mockUserProfile);
      setIsAdmin(mockUserProfile.role === 'admin');
      return;
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      setUserProfile(data);
      setIsAdmin(data.role === 'admin');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      setIsAdmin(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabaseConfigured) {
      // Mock sign in for development
      setUser({ id: mockUserProfile.id } as User);
      setUserProfile(mockUserProfile);
      setIsAdmin(mockUserProfile.role === 'admin');
      return { error: null };
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, full_name: string) => {
    if (!supabaseConfigured) {
      // Mock sign up for development
      setUser({ id: mockUserProfile.id } as User);
      setUserProfile(mockUserProfile);
      setIsAdmin(mockUserProfile.role === 'admin');
      return { error: null, data: { user: mockUserProfile } };
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name }
        }
      });
      
      return { data, error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    if (!supabaseConfigured) {
      // Mock sign out for development
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }

    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};