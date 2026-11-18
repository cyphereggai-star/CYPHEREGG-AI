import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, Tier } from '@/lib/types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  upgradeTier: (tier: Tier) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const fetchProfile = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    if (error) {
      return null;
    }
    return data as Profile | null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    if (mounted.current) setProfile(p);
  }, [user, fetchProfile]);

  useEffect(() => {
    mounted.current = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted.current) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        fetchProfile(data.session.user.id).then((p) => {
          if (mounted.current) {
            setProfile(p);
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      (async () => {
        if (!mounted.current) return;
        setSession(sess);
        setUser(sess?.user ?? null);
        if (sess?.user) {
          const p = await fetchProfile(sess.user.id);
          if (mounted.current) setProfile(p);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted.current = false;
      sub.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) return { error: friendlyAuthError(error.message) };
        const newUser = data?.user;
        if (newUser) {
          try {
            await supabase
              .from('profiles')
              .upsert(
                { id: newUser.id, email, full_name: fullName, tier: 'free' },
                { onConflict: 'id' }
              );
          } catch {
            // profile upsert failure is non-fatal; session is still valid
          }
          const p = await fetchProfile(newUser.id);
          if (mounted.current) setProfile(p);
        }
        return { error: null };
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? friendlyAuthError(err.message)
              : 'Something went wrong during sign up. Please try again.',
        };
      }
    },
    [fetchProfile]
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: friendlyAuthError(error.message) };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    if (mounted.current) {
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  }, []);

  const upgradeTier = useCallback(
    async (tier: Tier) => {
      if (!user) return { error: 'Not signed in' };
      const { error } = await supabase
        .from('profiles')
        .update({ tier })
        .eq('id', user.id);
      if (error) return { error: error.message };
      const p = await fetchProfile(user.id);
      if (mounted.current) setProfile(p);
      return { error: null };
    },
    [user, fetchProfile]
  );

  const value: AuthContextValue = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    upgradeTier,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function friendlyAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'An account with this email already exists. Try signing in.';
  if (m.includes('invalid login') || m.includes('invalid credentials'))
    return 'Incorrect email or password.';
  if (m.includes('rate limit')) return 'Too many attempts. Please wait a moment.';
  if (m.includes('password') && m.includes('at least'))
    return 'Password must be at least 6 characters.';
  return msg;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
