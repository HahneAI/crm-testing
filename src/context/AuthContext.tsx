import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { getSupabase } from '../services/supabase';
import { UserProfile } from '../types/user';

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
  
  const authCheckInProgress = useRef(false);
  const initialized = useRef(false);

  const supabase = getSupabase();
  const supabaseConfigured = useMemo(() => !!supabase, [supabase]);

  const fetchUserProfile = async (userId: string) => {
  try {
    // Try new method first (auth_user_id) 
    let { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', userId)
      .single();
      
    // Fallback to old method if new method fails (for transition period)
    if (error || !data) {
      console.log('Trying fallback method for user lookup...');
      ({ data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single());
    }
    
    if (error) {
      console.error('User profile lookup failed, but continuing...:', error);
      // Don't throw - just set defaults to prevent infinite loops
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }
    
    if (data) {
      setUserProfile(data as UserProfile);
      setIsAdmin(data.role === 'admin');
      console.log('User profile loaded:', data.email, data.role);
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Prevent infinite loops by setting safe defaults
    setUserProfile(null);
    setIsAdmin(false);
  }
};

  useEffect(() => {
    if (initialized.current || !supabaseConfigured) return;
    initialized.current = true;

    const initializeAuth = async () => {
      if (authCheckInProgress.current) return;
      authCheckInProgress.current = true;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
        authCheckInProgress.current = false;
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          setIsAdmin(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, supabaseConfigured]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email:string, password: string, full_name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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