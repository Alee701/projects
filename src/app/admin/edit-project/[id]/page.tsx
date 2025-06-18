
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

function EditPageSkeleton() {
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
        router.replace('/login?message=access_denied_submit');
      } else if (projectId) {
        fetchProjectData();
      } else {
        // Should not happen if routing is correct
        toast({ title: "Error", description: "Project ID is missing.", variant: "destructive" });
        setPageLoading(false);
      }
    }
  }, [isAdmin, authLoading, user, router, projectId]);

  async function fetchProjectData() {
    setPageLoading(true);
    const { project, error } = await getProjectByIdFromFirestore(projectId);
    if (error || !project) {
      toast({
        title: "Error Fetching Project",
        description: error?.message || "Could not load project data for editing.",
        variant: "destructive",
      });
      // Optionally redirect if project not found
      // router.push('/admin/manage-projects?error=project_not_found');
      setProjectData(null);
    } else {
      setProjectData(project);
    }
    setPageLoading(false);
  }
  
  const handleFormSubmit = () => {
    // Optionally refetch or redirect after successful update
    // For now, the form itself shows a success toast.
    // We could redirect to manage projects:
    // router.push('/admin/manage-projects');
  }

  if (authLoading || (pageLoading && isAdmin)) {
    return <EditPageSkeleton />;
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle className="font-headline text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to edit projects. Please log in as an administrator.
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
  
  if (!projectData && !pageLoading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md text-center p-8">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle className="font-headline text-2xl mb-2">Project Not Found</CardTitle>
          <CardDescription className="mb-6">
            The project you are trying to edit could not be found or you do not have permission.
          </CardDescription>
          <Button asChild variant="outline">
            <Link href="/admin/manage-projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Manage Projects
            </Link>
          </Button>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      {/* Render ProjectForm only when projectData is loaded */}
      {projectData && <ProjectForm initialData={projectData} onFormSubmit={handleFormSubmit} />}
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
