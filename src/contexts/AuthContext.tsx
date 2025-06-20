
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
        const idTokenResult = await getIdTokenResult(parsedUser);
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
      const parsedUser = JSON.parse(storedUser);
      checkUserSession(parsedUser);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email?: string, password?: string) => {
    setIsLoading(true);
    if (!email || !password) {
        // No need to alert here, form validation or toast can handle it.
        // router.push('/login?message=login_failed'); 
        setIsLoading(false);
        // Let the form show the error, or if firebaseSignIn returns an error, it'll be handled below.
        // For direct calls if needed, ensure a message is always set.
        router.push('/login?message=credentials_required');
        return;
    }

    const { user: firebaseUser, error } = await firebaseSignIn(email, password);

    if (firebaseUser && !error) {
      try {
        const idTokenResult = await getIdTokenResult(firebaseUser);
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
