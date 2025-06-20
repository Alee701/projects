
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  auth,
  signInWithEmail as firebaseSignIn,
  signOutFirebase,
} from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { getIdTokenResult, onAuthStateChanged } from 'firebase/auth';

const LOGIN_PATH = '/super-secret-login-page';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();

  const processLoginSuccess = useCallback(async (loggedInUser: User) => {
    try {
      const idTokenResult = await getIdTokenResult(loggedInUser, true);
      if (idTokenResult.claims.admin === true) {
        setUser(loggedInUser);
        setIsAdmin(true);
        sessionStorage.setItem('isAdmin', 'true');
        router.replace('/admin/manage-projects');
      } else {
        await signOutFirebase();
        router.replace(LOGIN_PATH + '?message=not_admin');
      }
    } catch (claimsError) {
      console.error("Error fetching user claims:", claimsError);
      await signOutFirebase();
      router.replace(LOGIN_PATH + '?message=claims_error');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await processLoginSuccess(firebaseUser);
      } else {
        setUser(null);
        setIsAdmin(false);
        sessionStorage.removeItem('isAdmin');
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [processLoginSuccess]);


  const login = async (email?: string, password?: string) => {
    setIsLoading(true);
    if (!email || !password) {
        setIsLoading(false);
        router.replace(LOGIN_PATH + '?message=credentials_required');
        return;
    }

    const { user: firebaseUser, error } = await firebaseSignIn(email, password);

    if (firebaseUser && !error) {
      // onAuthStateChanged will handle processLoginSuccess
    } else {
      console.error("Login failed:", error?.message);
      setIsLoading(false);
      router.replace(LOGIN_PATH + '?message=login_failed');
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await signOutFirebase();
    router.push(LOGIN_PATH); // onAuthStateChanged will clear user state and set isLoading to false
  };


  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
    