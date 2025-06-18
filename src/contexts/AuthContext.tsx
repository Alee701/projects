
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { signInWithEmail as firebaseSignIn, signOutFirebase } from '@/lib/firebase';
import type { User } from 'firebase/auth'; 

const ADMIN_EMAILS = ["admin@example.com", "aleemran701@gmail.com"]; 

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

  useEffect(() => {
    const storedUser = sessionStorage.getItem('authUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (ADMIN_EMAILS.includes(parsedUser.email)) {
        setIsAdmin(true);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email?: string, password?: string) => {
    setIsLoading(true);
    if (!email || !password) {
        alert("Please enter both email and password.");
        setIsLoading(false);
        router.push('/login?message=login_failed'); 
        return;
    }

    const { user: firebaseUser, error } = await firebaseSignIn(email, password);

    if (firebaseUser && !error) {
      if (ADMIN_EMAILS.includes(firebaseUser.email ?? '')) {
        setUser(firebaseUser);
        setIsAdmin(true);
        sessionStorage.setItem('authUser', JSON.stringify(firebaseUser)); 
        sessionStorage.setItem('isAdmin', 'true'); 
        router.push('/admin/manage-projects');
      } else {
        await signOutFirebase(); 
        setUser(null);
        setIsAdmin(false);
        sessionStorage.removeItem('authUser');
        sessionStorage.removeItem('isAdmin');
        router.push('/login?message=not_admin');
      }
    } else {
      setUser(null);
      setIsAdmin(false);
      sessionStorage.removeItem('authUser');
      sessionStorage.removeItem('isAdmin');
      console.error("Login failed:", error?.message);
      router.push('/login?message=login_failed');
    }
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await signOutFirebase();
    setUser(null);
    setIsAdmin(false);
    sessionStorage.removeItem('authUser');
    sessionStorage.removeItem('isAdmin');
    router.push('/login');
    setIsLoading(false);
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
