
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProjectForm from '@/components/projects/ProjectForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Home, Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { getProjectByIdFromFirestore } from '@/lib/firebase';
import type { Project } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const LOGIN_PATH = '/super-secret-login-page';

function EditPageFormSkeleton() {
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

function EditPageSkeleton() { 
  return (
    <div className="space-y-8 py-8">
      <EditPageFormSkeleton />
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-10 w-48 rounded-md" />
      </div>
    </div>
  );
}

export default function EditProjectPage() {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();

  const [projectData, setProjectData] = useState<Project | null>(null);
  const [pageLoading, setPageLoading] = useState(true); 

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin || !user) {
        router.replace(LOGIN_PATH + '?message=access_denied_submit');
      } else if (projectId) {
        fetchProjectData();
      } else {
        toast({ title: "Error", description: "Project ID is missing.", variant: "destructive" });
        setPageLoading(false);
      }
    }
  }, [isAdmin, authLoading, user, router, projectId, toast]); 

  async function fetchProjectData() {
    setPageLoading(true);
    const { project, error } = await getProjectByIdFromFirestore(projectId);
    if (error || !project) {
      toast({
        title: "Error Fetching Project",
        description: error?.message || "Could not load project data for editing. It may have been deleted or the ID is incorrect.",
        variant: "destructive",
      });
      setProjectData(null); 
    } else {
      setProjectData(project);
    }
    setPageLoading(false);
  }
  
  const handleFormSubmit = () => {
     toast({
        title: "Project Updated",
        description: "The project details have been saved successfully.",
        variant: "default"
      });
      fetchProjectData(); 
  }

  if (authLoading) { 
    return <EditPageSkeleton />;
  }

  if (!isAdmin) { 
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md text-center p-6 shadow-xl rounded-lg">
          <CardHeader>
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle className="font-headline text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to edit projects. Please log in as an administrator.
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
  
  if (pageLoading) {
     return <EditPageSkeleton />; 
  }

  if (!projectData && !pageLoading) { 
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center py-8">
        <Card className="w-full max-w-lg p-8 shadow-xl rounded-lg">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
          <CardTitle className="font-headline text-2xl mb-2">Project Not Found</CardTitle>
          <CardDescription className="mb-6 text-lg">
            The project you are trying to edit could not be found. It may have been deleted or the ID is incorrect.
          </CardDescription>
          <Button variant="outline" asChild className="group transition-all hover:shadow-md">
            <Link href="/admin/manage-projects">
              <ArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Manage Projects
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      {projectData && <ProjectForm initialData={projectData} onFormSubmit={handleFormSubmit} />}
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

    