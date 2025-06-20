"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldAlert, Mail, KeyRound } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailForLink, setEmailForLink] = useState('');

  const { 
    login, 
    sendLoginLink, 
    isLoading: authIsLoading, 
    isSendingLink,
    isVerifyingLink,
    isAdmin 
  } = useAuth();
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'error' | 'success' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayMessage = useCallback((msg: string | null, type: 'error' | 'success' = 'error') => {
    setMessage(msg);
    setMessageType(msg ? type : null);
  }, []);

  useEffect(() => {
    if (isAdmin && !authIsLoading && !isVerifyingLink) {
      router.replace('/admin/manage-projects');
    }
  }, [isAdmin, authIsLoading, isVerifyingLink, router]);

  useEffect(() => {
    const msgParam = searchParams.get('message');
    const errorParam = searchParams.get('error'); // For Firebase errors from email link
    const modeParam = searchParams.get('mode'); // For email link success hint

    if (isVerifyingLink) {
      displayMessage("Verifying login link, please wait...", "success");
      return;
    }

    if (authIsLoading && !msgParam && !isAdmin) {
      // If auth is generally loading (e.g. onAuthStateChanged), don't show specific messages yet
      // unless it's a verification step.
      return;
    }


    if (msgParam) {
      switch (msgParam) {
        case 'not_admin':
          displayMessage('Access Denied: This account does not have admin privileges.');
          break;
        case 'access_denied':
        case 'access_denied_submit':
          displayMessage('Access Denied: You must be logged in as an admin to view this page.');
          break;
        case 'login_failed':
          displayMessage('Login failed. Please check your credentials and try again.');
          break;
        case 'credentials_required':
          displayMessage('Email and password are required for this login method.');
          break;
        case 'invalid_link':
          displayMessage('The login link is invalid or has expired. Please request a new one.');
          break;
        case 'email_not_found':
          displayMessage('Your email address was not found for link verification. Please try sending the link again.');
          break;
        case 'link_signin_failed':
          const errorCode = searchParams.get('code');
          displayMessage(`Login with link failed. ${errorCode ? `Error: ${errorCode}. ` : ''}Please try again or use password.`);
          break;
        case 'claims_error':
            displayMessage('Could not verify admin status. Please try logging in again.');
            break;
        case 'link_sent':
          displayMessage("Login link sent! Check your email (and spam folder) to complete sign-in.", "success");
          break;
        case 'link_send_failed':
          displayMessage("Failed to send login link. Please ensure your email is correct and try again.");
          break;
        default:
          displayMessage(null);
      }
    } else if (modeParam === 'signIn' && errorParam) {
      // Handle Firebase specific errors from email link if not caught by custom messages
      displayMessage(`Error during sign-in: ${errorParam}`);
    } else {
      displayMessage(null);
    }
  }, [searchParams, isVerifyingLink, authIsLoading, isAdmin, displayMessage]);


  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    displayMessage(null);
    await login(email, password);
    setIsSubmitting(false);
  };

  const handleEmailLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    displayMessage(null);
    await sendLoginLink(emailForLink);
    // Message display is handled by AuthContext via router push with query params
    setIsSubmitting(false);
  };
  
  if (authIsLoading && !message && !isAdmin && !isVerifyingLink) {
     return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }
  
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-160px)] px-4 py-8 sm:py-12 bg-background">
      <div className="w-full max-w-4xl lg:max-w-5xl mx-auto overflow-hidden rounded-xl shadow-2xl bg-card md:grid md:grid-cols-2">
        <div className="relative hidden md:flex bg-primary/5 dark:bg-primary/10">
          <Image
            src="https://placehold.co/800x1000.png" 
            alt="Admin Login Illustration"
            fill
            className="object-cover"
            priority
            sizes="50vw"
            data-ai-hint="administration secure login"
          />
        </div>

        <div className="flex flex-col justify-center p-6 py-12 sm:p-10 md:p-12 lg:p-16">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold text-primary font-headline lg:text-4xl">Admin Portal</h1>
            <p className="text-muted-foreground mt-2">Secure access for Code with Ali Imran administrators.</p>
          </div>

          {message && (
            <div className="mb-6">
              <div className={`border p-3 rounded-md flex items-center gap-2 text-sm ${messageType === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
                <ShieldAlert className={`${messageType === 'success' ? 'text-green-600 dark:text-green-500' : 'text-destructive'}`} />
                <span>{message}</span>
              </div>
            </div>
          )}

          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="password"><KeyRound className="mr-2"/> Password</TabsTrigger>
              <TabsTrigger value="email-link"><Mail className="mr-2"/> Email Link</TabsTrigger>
            </TabsList>
            <TabsContent value="password">
              <Card className="border-none shadow-none">
                <CardHeader className="px-1 pt-0">
                  <CardTitle className="text-xl">Sign in with Password</CardTitle>
                  <CardDescription>Enter your administrator email and password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-1 pb-0">
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isSubmitting || authIsLoading || isVerifyingLink}
                        className="h-11 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting || authIsLoading || isVerifyingLink}
                        className="h-11 text-base"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting || authIsLoading || isVerifyingLink || isSendingLink}>
                      {(isSubmitting && !isSendingLink) || (authIsLoading && !isVerifyingLink && !isSendingLink) ? <Loader2 className="animate-spin" /> : "Secure Login"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="email-link">
               <Card className="border-none shadow-none">
                <CardHeader className="px-1 pt-0">
                  <CardTitle className="text-xl">Sign in with Email Link</CardTitle>
                  <CardDescription>Enter your admin email to receive a secure login link.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-1 pb-0">
                  <form onSubmit={handleEmailLinkSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email-link-input">Email Address</Label>
                      <Input
                        id="email-link-input"
                        type="email"
                        placeholder="admin@example.com"
                        value={emailForLink}
                        onChange={(e) => setEmailForLink(e.target.value)}
                        required
                        disabled={isSubmitting || authIsLoading || isVerifyingLink || isSendingLink}
                        className="h-11 text-base"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting || authIsLoading || isVerifyingLink || isSendingLink}>
                      {isSendingLink || (isSubmitting && !authIsLoading) ? <Loader2 className="animate-spin" /> : "Send Login Link"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function LoginPageSkeleton() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-160px)] px-4 py-8 sm:py-12 bg-background">
      <div className="w-full max-w-4xl lg:max-w-5xl mx-auto overflow-hidden rounded-xl shadow-2xl bg-card md:grid md:grid-cols-2">
        <div className="relative hidden md:flex bg-muted/30">
          <Skeleton className="w-full h-[500px] md:h-full" />
        </div>
        <div className="flex flex-col justify-center p-6 py-12 sm:p-10 md:p-12 lg:p-16 space-y-8">
          <div className="mb-8 text-center md:text-left space-y-3">
            <Skeleton className="h-10 w-3/4 mx-auto md:mx-0" />
            <Skeleton className="h-5 w-full md:w-5/6 mx-auto md:mx-0" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" /> {/* TabsList Skeleton */}
          </div>

          <div className="space-y-6"> {/* Form Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-11 w-full" />
            </div>
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginPageContent />
    </Suspense>
  );
}

    