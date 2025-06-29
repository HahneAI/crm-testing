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

  // Always use mock authentication - no Supabase required
  const supabaseConfigured = useMemo(() => false, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Always use mock data
      setUserProfile(mockUserProfile);
      setIsAdmin(mockUserProfile.role === 'admin');
      return;
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
        // Always use mock auth - instant login
        setUser({ id: mockUserProfile.id } as User);
        setUserProfile(mockUserProfile);
        setIsAdmin(mockUserProfile.role === 'admin');
        setLoading(false);
        authCheckInProgress.current = false;
        
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

    initializeAuth();
  }, [supabaseConfigured]);

  const signIn = async (email: string, password: string) => {
    // Always use mock sign in
    setUser({ id: mockUserProfile.id } as User);
    setUserProfile(mockUserProfile);
    setIsAdmin(mockUserProfile.role === 'admin');
    return { error: null };
  };

  const signUp = async (email: string, password: string, full_name: string) => {
    // Always use mock sign up
    setUser({ id: mockUserProfile.id } as User);
    setUserProfile(mockUserProfile);
    setIsAdmin(mockUserProfile.role === 'admin');
    return { error: null, data: { user: mockUserProfile } };
  };

  const signOut = async () => {
    // Mock sign out - but keep user logged in for no-auth mode
    // Don't actually sign out to maintain access
    return;
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