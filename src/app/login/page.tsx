
"use client";

import { useState, useEffect, Suspense } from 'react'; // Added Suspense
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useRouter

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, isAdmin } = useAuth(); // Added isAdmin
  const searchParams = useSearchParams();
  const router = useRouter(); // Added useRouter
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      router.replace('/admin/manage-projects'); // Redirect if already admin
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
    // Validation is now handled inside login function or by Firebase
    await login(email, password);
  };

  if (isLoading && !message) { // Show loader only if not displaying an error message already
     return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin panel.</CardDescription>
        </CardHeader>
        {message && (
          <div className="p-4 mb-0 text-center">
            <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-md flex items-center gap-2 text-sm">
              <ShieldAlert className="h-5 w-5" /> 
              <span>{message}</span>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    // Suspense is required by Next.js when using useSearchParams in a page.
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
