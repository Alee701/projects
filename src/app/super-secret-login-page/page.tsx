
"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldAlert, KeyRound } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading: authIsLoading, isAdmin } = useAuth();

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
    if (isAdmin && !authIsLoading) {
      router.replace('/admin/manage-projects');
    }
  }, [isAdmin, authIsLoading, router]);

  useEffect(() => {
    const msgParam = searchParams.get('message');
    const errorParam = searchParams.get('error');

    if (authIsLoading && !msgParam && !isAdmin) {
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
        case 'claims_error':
          displayMessage('Could not verify admin status. Please try logging in again.');
          break;
        default:
          displayMessage(null);
      }
    } else if (errorParam) {
        displayMessage(`Error during sign-in: ${errorParam}`);
    }
     else {
      displayMessage(null);
    }
  }, [searchParams, authIsLoading, isAdmin, displayMessage]);


  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    displayMessage(null);
    await login(email, password);
    setIsSubmitting(false);
  };

  if (authIsLoading && !message && !isAdmin) {
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
            src="https://res.cloudinary.com/dkfvndipz/image/upload/v1750632942/Code_with_Ali_Imran_uld2i6.png"
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

          <Card className="border-none shadow-none">
            <CardHeader className="px-1 pt-0">
              <CardTitle className="text-xl flex items-center gap-2"><KeyRound/> Sign in with Password</CardTitle>
              <CardDescription>Enter your administrator email and password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-1 pb-0">
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email-password">Email Address</Label>
                  <Input
                    id="email-password"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting || authIsLoading}
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
                    disabled={isSubmitting || authIsLoading}
                    className="h-11 text-base"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting || authIsLoading}>
                  {isSubmitting || (authIsLoading && !isAdmin) ? <Loader2 className="animate-spin" /> : "Secure Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
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


export default function SuperSecretLoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginPageContent />
    </Suspense>
  );
}
