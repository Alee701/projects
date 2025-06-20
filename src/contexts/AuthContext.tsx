
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
      setIsVerifyingLink(false);
    }
  }, [router]);

  const attemptToCompleteSignIn = useCallback(async () => {
    if (verifyIsLoginLink(window.location.href)) {
      setIsVerifyingLink(true);
      setIsLoading(true);
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        console.warn("Email not found in localStorage for link sign-in.");
        router.replace(LOGIN_PATH + '?message=email_not_found');
        setIsVerifyingLink(false);
        setIsLoading(false);
        return;
      }
      
      const { user: firebaseUser, error } = await signInUserWithLink(email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      
      if (firebaseUser && !error) {
        // onAuthStateChanged will call processLoginSuccess
      } else {
        console.error("Error signing in with email link:", error?.message);
        router.replace(LOGIN_PATH + `?message=link_signin_failed&code=${error?.code || 'unknown'}`);
        setIsVerifyingLink(false);
        setIsLoading(false);
      }
      // Clean the URL by removing query params
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, LOGIN_PATH);
      }
    } else {
      // If not an email link sign-in, and no user is initially signed in via onAuthStateChanged,
      // then we are done with initial loading.
      if(!auth.currentUser) {
        setIsLoading(false);
      }
    }
  }, [router]);


  useEffect(() => {
    setIsLoading(true); // Start with loading true
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in (could be from password, link, or existing session)
        await processLoginSuccess(firebaseUser);
      } else {
        // User is signed out or no user in session
        setUser(null);
        setIsAdmin(false);
        sessionStorage.removeItem('isAdmin');
        setIsLoading(false); // Finished loading, no user
        setIsVerifyingLink(false); 
        
        // If not a sign-in link and no user, attemptToCompleteSignIn would have set isLoading to false.
        // If it IS a sign-in link, attemptToCompleteSignIn will be called and handle loading state.
        // This explicit call to attemptToCompleteSignIn is for the case where onAuthStateChanged 
        // runs *before* the page fully parses the URL or if it's the very first load with a link.
        if (verifyIsLoginLink(window.location.href)) {
           await attemptToCompleteSignIn();
        }
      }
    });
  
    // Initial check for email link if onAuthStateChanged hasn't fired with a user yet.
    // This handles the scenario where the page loads directly with a sign-in link.
    if (!auth.currentUser && verifyIsLoginLink(window.location.href)) {
      attemptToCompleteSignIn();
    } else if (!auth.currentUser) {
      // If no current user and not a sign-in link, initial loading check is done.
      setIsLoading(false);
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
      // onAuthStateChanged will handle processLoginSuccess
    } else {
      console.error("Login failed:", error?.message);
      router.replace(LOGIN_PATH + '?message=login_failed');
      setIsLoading(false); // Explicitly set loading false on direct failure before onAuthStateChanged
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
      let message = 'link_send_failed';
      if (error.code === 'auth/operation-not-allowed') {
        message = 'link_send_not_allowed';
      }
      router.push(LOGIN_PATH + `?message=${message}`);
    } finally {
      setIsSendingLink(false);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await signOutFirebase();
    // onAuthStateChanged will clear user and admin state, and set isLoading to false.
    router.push(LOGIN_PATH);
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
