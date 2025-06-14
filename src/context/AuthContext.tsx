import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useRef } from 'react';
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
  
  // Prevent multiple concurrent auth checks
  const authCheckInProgress = useRef(false);
  const initialized = useRef(false);

  // Check if Supabase is configured - using useMemo to prevent recalculation on every render
  const supabaseConfigured = useMemo(() => 
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== 'your-supabase-project-url',
  []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Always fall back to mock data if Supabase isn't configured
      if (!supabaseConfigured) {
        setUserProfile(mockUserProfile);
        setIsAdmin(mockUserProfile.role === 'admin');
        return;
      }

      const supabase = getSupabase();
      
      // Check if user profile exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the error for no rows returned
        throw fetchError;
      }
      
      // If user doesn't exist in our custom users table, try to create profile
      if (!existingUser) {
        // Get user details from auth
        const { data: authUser } = await supabase.auth.getUser(userId);
        
        if (authUser?.user) {
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: authUser.user.email || '',
              full_name: authUser.user.user_metadata?.full_name || '',
              role: 'admin' // Default role
            })
            .select()
            .single();
          
          // If insert fails due to RLS policies, fall back to mock data
          if (insertError) {
            setUserProfile(mockUserProfile);
            setIsAdmin(true);
            return;
          }
          
          setUserProfile(newUser);
          setIsAdmin(newUser.role === 'admin');
          return;
        }
      } else {
        // User exists, set profile
        setUserProfile(existingUser);
        setIsAdmin(existingUser.role === 'admin');
        return;
      }
    } catch (error) {
      // Final fallback to mock data on any error
      setUserProfile(mockUserProfile);
      setIsAdmin(true);
    }
  };

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initialized.current) return;
    initialized.current = true;

    const initializeAuth = async () => {
      // Prevent multiple concurrent auth checks
      if (authCheckInProgress.current) return;
      authCheckInProgress.current = true;

      try {
        // Mock auth for development when Supabase isn't configured
        if (!supabaseConfigured) {
          // Simulate a brief loading state
          setTimeout(() => {
            setUser({ id: mockUserProfile.id } as User);
            setUserProfile(mockUserProfile);
            setIsAdmin(mockUserProfile.role === 'admin');
            setLoading(false);
            authCheckInProgress.current = false;
          }, 1000);
          return;
        }

        // Real Supabase auth logic when configured
        const supabase = getSupabase();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          // Only handle actual auth changes, not initial session
          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            setSession(session);
            setUser(session?.user || null);
            
            if (session?.user) {
              await fetchUserProfile(session.user.id);
            } else {
              setUserProfile(null);
              setIsAdmin(false);
            }
          }
        });

        // Cleanup function
        return () => {
          subscription.unsubscribe();
        };
        
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Fall back to mock data on any error
        setUser({ id: mockUserProfile.id } as User);
        setUserProfile(mockUserProfile);
        setIsAdmin(mockUserProfile.role === 'admin');
      } finally {
        setLoading(false);
        authCheckInProgress.current = false;
      }
    };

    const cleanup = initializeAuth();
    
    // Return cleanup function
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => {
          if (cleanupFn && typeof cleanupFn === 'function') {
            cleanupFn();
          }
        });
      }
    };
  }, [supabaseConfigured]);

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