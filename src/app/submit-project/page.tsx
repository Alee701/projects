
"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProjectForm from '@/components/projects/ProjectForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Home, Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SubmitPageSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/5 mb-2" />
          <Skeleton className="h-5 w-4/5" />
        </CardHeader>
        <CardContent className="space-y-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className={i === 1 ? "h-20 w-full" : "h-10 w-full"} /> {/* Textarea is taller */}
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-10 w-48" />
      </div>
    </div>
  );
}


export default function SubmitProjectPage() {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin || !user) {
        router.replace('/login?message=access_denied_submit');
      }
    }
  }, [isAdmin, authLoading, user, router]);

  if (authLoading) {
    return <SubmitPageSkeleton />;
  }

  if (!isAdmin) {
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
      <ProjectForm /> {/* Pass null or no initialData for new project */}
       <div className="max-w-2xl mx-auto">
         <Button variant="outline" asChild>
            <Link href="/admin/manage-projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Manage Projects
            </Link>
          </Button>
       </div>
    </div>
  );
}
