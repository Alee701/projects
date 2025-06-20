
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { signInWithEmail as firebaseSignIn, signOutFirebase } from '@/lib/firebase';
import type { User } from 'firebase/auth'; 
import { getIdTokenResult } from 'firebase/auth'; // Import for custom claims

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
    const checkUserSession = async (parsedUser: User) => {
      try {
        // Force refresh the token to get latest claims
        const idTokenResult = await getIdTokenResult(parsedUser, true); 
        if (idTokenResult.claims.admin === true) {
          setIsAdmin(true);
          sessionStorage.setItem('isAdmin', 'true');
        } else {
          setIsAdmin(false);
          sessionStorage.removeItem('isAdmin');
        }
      } catch (error) {
        console.error("Error fetching token claims for session user:", error);
        setIsAdmin(false); // Default to not admin if claims can't be fetched
        sessionStorage.removeItem('isAdmin');
      } finally {
        setUser(parsedUser);
        setIsLoading(false);
      }
    };

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User; // Add type assertion
        checkUserSession(parsedUser);
      } catch (e) {
        console.error("Error parsing stored user from session storage:", e);
        sessionStorage.removeItem('authUser');
        sessionStorage.removeItem('isAdmin');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email?: string, password?: string) => {
    setIsLoading(true);
    if (!email || !password) {
        setIsLoading(false);
        router.push('/login?message=credentials_required');
        return;
    }

    const { user: firebaseUser, error } = await firebaseSignIn(email, password);

    if (firebaseUser && !error) {
      try {
        // Force refresh the token to ensure we have the latest claims
        const idTokenResult = await getIdTokenResult(firebaseUser, true); 
        if (idTokenResult.claims.admin === true) {
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
      } catch (claimsError) {
        console.error("Error fetching user claims:", claimsError);
        await signOutFirebase();
        setUser(null);
        setIsAdmin(false);
        sessionStorage.removeItem('authUser');
        sessionStorage.removeItem('isAdmin');
        router.push('/login?message=claims_error');
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
