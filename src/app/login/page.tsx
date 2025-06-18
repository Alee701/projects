
"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading: authIsLoading, isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (isAdmin) {
      router.replace('/admin/manage-projects');
    }
    const msg = searchParams.get('message');
    if (msg === 'not_admin') {
      setMessage('Access Denied: This account does not have admin privileges.');
    } else if (msg === 'access_denied' || msg === 'access_denied_submit') {
      setMessage('Access Denied: You must be logged in as an admin to view this page.');
    } else if (msg === 'login_failed') {
      setMessage('Login failed. Please check your credentials and try again.');
    } else {
      setMessage(null);
    }
  }, [searchParams, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null); 
    await login(email, password);
    // isLoading state in AuthContext will change, triggering useEffect or redirect.
    // If login fails, AuthContext sets message and redirects.
    setIsSubmitting(false); // Reset submitting state regardless of outcome
  };

  if (authIsLoading && !message && !isAdmin) { // Only show global loader if not already showing a message or if admin check is pending
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
              <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-md flex items-center gap-2 text-sm">
                <ShieldAlert />
                <span>{message}</span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
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
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Secure Login"}
            </Button>
          </form>
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
          <div className="space-y-6">
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
