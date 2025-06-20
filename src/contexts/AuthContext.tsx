
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; 
import { 
  auth,
  signInWithEmail as firebaseSignIn, 
  signOutFirebase,
  requestLoginLinkForEmail,
  verifyIsLoginLink,
  signInUserWithLink,
  defaultActionCodeSettings,
} from '@/lib/firebase';
import type { User } from 'firebase/auth'; 
import { getIdTokenResult, onAuthStateChanged } from 'firebase/auth';

const LOGIN_PATH = '/super-secret-login-page';

interface AuthContextType {
  user: User | null; 
  isAdmin: boolean;
  isLoading: boolean;
  isSendingLink: boolean;
  isVerifyingLink: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  sendLoginLink: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSendingLink, setIsSendingLink] = useState<boolean>(false);
  const [isVerifyingLink, setIsVerifyingLink] = useState<boolean>(false);
  
  const router = useRouter();
  const searchParams = useSearchParams(); // Get searchParams here to avoid calling hook in callback

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
        // setUser(null) and setIsAdmin(false) will be handled by onAuthStateChanged
        router.replace(LOGIN_PATH + '?message=not_admin');
      }
    } catch (claimsError) {
      console.error("Error fetching user claims:", claimsError);
      await signOutFirebase();
      // setUser(null) and setIsAdmin(false) will be handled by onAuthStateChanged
      router.replace(LOGIN_PATH + '?message=claims_error');
    } finally {
      setIsLoading(false);
      setIsVerifyingLink(false);
    }
  }, [router]);

  const attemptToCompleteSignIn = useCallback(async () => {
    if (verifyIsLoginLink(window.location.href)) {
      setIsVerifyingLink(true);
      setIsLoading(true);
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        // User opened the link on a different device. To prevent session fixation
        // attacks, ask the user to provide the email again. For simplicity,
        // we'll redirect to login with an error. A more robust solution
        // might involve a dedicated page to re-enter the email.
        console.warn("Email not found in localStorage for link sign-in.");
        router.replace(LOGIN_PATH + '?message=email_not_found');
        setIsVerifyingLink(false);
        setIsLoading(false);
        return;
      }
      
      const { user: firebaseUser, error } = await signInUserWithLink(email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      
      if (firebaseUser && !error) {
        // processLoginSuccess will be called by onAuthStateChanged
        // No need to call it directly here
      } else {
        console.error("Error signing in with email link:", error?.message);
        router.replace(LOGIN_PATH + `?message=link_signin_failed&code=${error?.code || 'unknown'}`);
        setIsVerifyingLink(false);
        setIsLoading(false);
      }
      // Clean the URL
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, LOGIN_PATH);
      }
    } else {
      setIsLoading(false); // Not a sign-in link, normal loading done
    }
  }, [router, processLoginSuccess]);


  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in.
        await processLoginSuccess(firebaseUser);
      } else {
        // User is signed out.
        setUser(null);
        setIsAdmin(false);
        sessionStorage.removeItem('isAdmin');
        setIsLoading(false);
        setIsVerifyingLink(false); // Ensure this is reset on logout
      }
    });
  
    // Check for email link sign-in attempt on initial load
    // But only if not already processing via onAuthStateChanged
    if (!auth.currentUser) {
      attemptToCompleteSignIn();
    }
  
    return () => unsubscribe();
  }, [processLoginSuccess, attemptToCompleteSignIn]);


  const login = async (email?: string, password?: string) => {
    setIsLoading(true);
    if (!email || !password) {
        setIsLoading(false);
        router.replace(LOGIN_PATH + '?message=credentials_required');
        return;
    }

    const { user: firebaseUser, error } = await firebaseSignIn(email, password);

    if (firebaseUser && !error) {
      // onAuthStateChanged will handle the rest
    } else {
      // onAuthStateChanged will set user to null, clear admin state
      console.error("Login failed:", error?.message);
      router.replace(LOGIN_PATH + '?message=login_failed');
      setIsLoading(false); // Explicitly set loading false on direct failure
    }
  };

  const sendLoginLink = async (email: string) => {
    setIsSendingLink(true);
    setIsLoading(true);
    try {
      await requestLoginLinkForEmail(email, defaultActionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      router.push(LOGIN_PATH + '?message=link_sent');
    } catch (error: any) {
      console.error("Error sending login link:", error);
      router.push(LOGIN_PATH + '?message=link_send_failed');
    } finally {
      setIsSendingLink(false);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await signOutFirebase();
    // onAuthStateChanged will clear user and admin state.
    router.push(LOGIN_PATH);
    // setIsLoading(false) will be handled by onAuthStateChanged flow
  };
 

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, isSendingLink, isVerifyingLink, login, sendLoginLink, logout }}>
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

    