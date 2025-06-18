
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import { signInWithEmail as firebaseSignIn, signOutFirebase } from '@/lib/firebase';
import type { User } from 'firebase/auth'; // Import User type

// Define the designated admin email(s)
// For a real application, consider storing this in an environment variable or a secure config
const ADMIN_EMAILS = ["admin@example.com", "ali.imran@example.com"]; // Replace with your actual admin email(s)

interface AuthContextType {
  user: User | null; // Store the whole user object
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
    // This effect simulates checking auth status on mount.
    // In a real Firebase app with onAuthStateChanged listener in firebase.ts,
    // this might be redundant or could be simplified.
    // For now, it checks sessionStorage.
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
        return;
    }

    const { user: firebaseUser, error } = await firebaseSignIn(email, password);

    if (firebaseUser && !error) {
      if (ADMIN_EMAILS.includes(firebaseUser.email ?? '')) {
        setUser(firebaseUser);
        setIsAdmin(true);
        sessionStorage.setItem('authUser', JSON.stringify(firebaseUser)); // Store user object
        sessionStorage.setItem('isAdmin', 'true'); // Still useful for quick checks if needed elsewhere
        router.push('/admin/manage-projects');
      } else {
        // Logged in successfully but not an admin
        await signOutFirebase(); // Sign them out immediately
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
      // The error message will be displayed by the login page based on firebase.ts alert
      // No need for an extra alert here, but you might want to redirect with a generic error
      // router.push('/login?message=login_failed');
    }
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await firebaseSignOut();
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
