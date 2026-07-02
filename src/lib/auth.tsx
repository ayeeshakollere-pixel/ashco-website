// ============================================================================
//  AuthProvider — tracks the currently signed-in user and their profile
//  (including whether they're an admin). Wrap the app in this once, then any
//  component can call useAuth() to know who's logged in.
// ============================================================================
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, supabaseReady } from '@/lib/supabase';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  company: string | null;
  is_admin: boolean;
  order_count: number;
}

interface AuthState {
  ready: boolean;            // has the initial session check finished?
  userId: string | null;
  email: string | null;
  profile: Profile | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  async function loadProfile(id: string) {
    if (!supabaseReady) return;
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, phone, company, is_admin, order_count')
      .eq('id', id)
      .single();
    setProfile((data as Profile) ?? null);
  }

  async function refresh() {
    if (!supabaseReady) {
      setReady(true);
      return;
    }
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (user) {
      setUserId(user.id);
      setEmail(user.email ?? null);
      await loadProfile(user.id);
    } else {
      setUserId(null);
      setEmail(null);
      setProfile(null);
    }
    setReady(true);
  }

  useEffect(() => {
    refresh();

    if (!supabaseReady) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      const user = session?.user;
      if (user) {
        setUserId(user.id);
        setEmail(user.email ?? null);
        loadProfile(user.id);
      } else {
        setUserId(null);
        setEmail(null);
        setProfile(null);
      }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    if (supabaseReady) await supabase.auth.signOut();
    setUserId(null);
    setEmail(null);
    setProfile(null);
  }

  const value: AuthState = {
    ready,
    userId,
    email,
    profile,
    isAdmin: Boolean(profile?.is_admin),
    signOut,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
