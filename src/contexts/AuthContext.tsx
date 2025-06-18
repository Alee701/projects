
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail as firebaseSignIn, signOutFirebase } from '@/lib/firebase';

interface AuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true
  const router = useRouter();

  useEffect(() => {
    // Simulate checking auth status on mount (e.g., from localStorage or a cookie)
    // In a real Firebase app, you'd use onAuthStateChanged here.
    const storedIsAdmin = sessionStorage.getItem('isAdmin');
    if (storedIsAdmin === 'true') {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email?: string, password?: string) => {
    setIsLoading(true);
    // In a real app, replace this with actual Firebase auth
    // For now, any non-empty email/password will grant admin access
    const { user, error } = await firebaseSignIn(email, password);
    if (user && !error) {
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true'); // Persist admin state for session
      router.push('/admin/manage-projects');
    } else {
      setIsAdmin(false);
      sessionStorage.removeItem('isAdmin');
      // Optionally, handle login error (e.g., show a toast)
      console.error("Login failed:", error?.message);
      alert(`Login failed: ${error?.message || "Please try again."}`);
    }
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await firebaseSignOut();
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
    router.push('/login');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isLoading, login, logout }}>
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
