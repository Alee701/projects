
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProjectForm from '@/components/projects/ProjectForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Home, Loader2, ShieldAlert } from 'lucide-react';

export default function SubmitProjectPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);


  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.replace('/login?message=access_denied_submit');
      } else {
        setPageLoading(false);
      }
    }
  }, [isAdmin, authLoading, router]);

  if (authLoading || pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    // This case should ideally be handled by the redirect, but as a fallback:
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md text-center">
           <CardHeader>
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle className="font-headline text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to submit new projects. Please log in as an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">
                 <Home className="mr-2 h-4 w-4" />
                Go to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProjectForm />
       <div className="max-w-2xl mx-auto">
         <Button variant="outline" asChild>
            <Link href="/admin/manage-projects">
              Back to Manage Projects
            </Link>
          </Button>
       </div>
    </div>
  );
}
