
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

const LOGIN_PATH = '/super-secret-login-page';

function SubmitPageFormSkeleton() {
  return (
    <Card className="max-w-2xl mx-auto shadow-xl rounded-xl">
      <CardHeader>
        <Skeleton className="h-8 w-3/5 mb-2 rounded" />
        <Skeleton className="h-5 w-4/5 rounded" />
      </CardHeader>
      <CardContent className="space-y-8">
        {[...Array(6)].map((_, i) => ( 
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-1/4 rounded" />
            <Skeleton className={i === 1 ? "h-24 w-full rounded" : "h-10 w-full rounded"} /> 
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        ))}
        <Skeleton className="h-10 w-32 rounded-md" />
      </CardContent>
    </Card>
  );
}


function SubmitPageSkeleton() {
  return (
    <div className="space-y-8 py-8">
      <SubmitPageFormSkeleton />
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-10 w-48 rounded-md" />
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
        router.replace(LOGIN_PATH + '?message=access_denied_submit');
      }
    }
  }, [isAdmin, authLoading, user, router]);

  if (authLoading) {
    return <SubmitPageSkeleton />;
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md text-center p-6 shadow-xl rounded-lg">
           <CardHeader>
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle className="font-headline text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to submit new projects. Please log in as an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={LOGIN_PATH}>
                 <Home />
                Go to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <ProjectForm /> 
       <div className="max-w-2xl mx-auto">
         <Button variant="outline" asChild className="group transition-all hover:shadow-md">
            <Link href="/admin/manage-projects">
              <ArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Manage Projects
            </Link>
          </Button>
       </div>
    </div>
  );
}

    