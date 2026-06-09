import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getUser, type UserDoc } from '@repo/core';
import { auth } from '../lib/firebase';

type AuthStatus = 'loading' | 'signedOut' | 'needsOnboarding' | 'ready';

interface AuthContextValue {
  user: User | null;
  profile: UserDoc | null;
  status: AuthStatus;
  /** Re-read the Firestore profile (call after completing onboarding). */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  async function loadProfile(u: User) {
    const doc = await getUser(u.uid);
    setProfile(doc);
    setStatus(doc?.onboardingComplete ? 'ready' : 'needsOnboarding');
  }

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setStatus('signedOut');
        return;
      }
      setStatus('loading');
      try {
        await loadProfile(u);
      } catch (e) {
        console.warn('[auth] failed to load profile', e);
        setStatus('needsOnboarding');
      }
    });
  }, []);

  const refreshProfile = async () => {
    if (user) await loadProfile(user);
  };

  return (
    <AuthContext.Provider value={{ user, profile, status, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
