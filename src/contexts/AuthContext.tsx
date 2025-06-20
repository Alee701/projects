
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
        const newUrl = window.location.pathname; // Keep the current path (e.g., /super-secret-login-page)
        window.history.replaceState({}, document.title, newUrl);
      }
    } else {
      if(!auth.currentUser) {
        setIsLoading(false);
      }
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
        setIsVerifyingLink(false);
        // Only set isLoading to false if not actively verifying a link.
        // attemptToCompleteSignIn will handle isLoading if it's a link scenario.
        if (!verifyIsLoginLink(window.location.href)) {
            setIsLoading(false);
        } else {
            // If it is a link, attempt to complete sign in.
            // This handles the case where onAuthStateChanged fires with user=null *before* link processing.
            await attemptToCompleteSignIn();
        }
      }
    });

    // Initial check for email link if onAuthStateChanged hasn't fired with a user yet.
    if (!auth.currentUser && verifyIsLoginLink(window.location.href)) {
      attemptToCompleteSignIn();
    } else if (!auth.currentUser) {
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
      setIsLoading(false);
      router.replace(LOGIN_PATH + '?message=login_failed');
    }
  };

  const sendLoginLink = async (email: string) => {
    setIsSendingLink(true);
    setIsLoading(true);
    try {
      await requestLoginLinkForEmail(email, defaultActionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      // Do not redirect here yet, let the user click the link in their email.
      // Update the message on the current page.
      router.replace(LOGIN_PATH + '?message=link_sent');

    } catch (error: any) {
      console.error("Error sending login link:", error);
      let message = 'link_send_failed';
      if (error.code === 'auth/operation-not-allowed') {
        message = 'link_send_not_allowed';
      }
      router.replace(LOGIN_PATH + `?message=${message}`);
    } finally {
      setIsSendingLink(false);
      //isLoading will be set to false by onAuthStateChanged or if an error occurs during login
      //or by processLoginSuccess if login is successful. Here, we only know link sending attempt is done.
      //If user is not logged in yet, isLoading should reflect that.
      if(!auth.currentUser){
        setIsLoading(false);
      }
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await signOutFirebase();
    router.push(LOGIN_PATH); // onAuthStateChanged will clear user state and set isLoading to false
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

    