
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

function EditPageFormSkeleton() {
  return (
    <Card className="max-w-2xl mx-auto shadow-xl rounded-xl">
      <CardHeader>
        <Skeleton className="h-8 w-3/5 mb-2 rounded" />
        <Skeleton className="h-5 w-4/5 rounded" />
      </CardHeader>
      <CardContent className="space-y-8">
        {[...Array(6)].map((_, i) => ( // Increased to 6 for all fields
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-1/4 rounded" />
            <Skeleton className={i === 1 ? "h-24 w-full rounded" : "h-10 w-full rounded"} /> {/* Textarea is taller */}
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        ))}
        <Skeleton className="h-10 w-32 rounded-md" />
      </CardContent>
    </Card>
  );
}

function EditPageSkeleton() { // More generic page skeleton
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
  const [pageLoading, setPageLoading] = useState(true); // For project data fetching

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin || !user) {
        router.replace('/login?message=access_denied_submit');
      } else if (projectId) {
        fetchProjectData();
      } else {
        toast({ title: "Error", description: "Project ID is missing.", variant: "destructive" });
        setPageLoading(false);
      }
    }
  }, [isAdmin, authLoading, user, router, projectId, toast]); // Added toast to dependencies

  async function fetchProjectData() {
    setPageLoading(true);
    const { project, error } = await getProjectByIdFromFirestore(projectId);
    if (error || !project) {
      toast({
        title: "Error Fetching Project",
        description: error?.message || "Could not load project data for editing. It may have been deleted or the ID is incorrect.",
        variant: "destructive",
      });
      setProjectData(null); // Explicitly set to null on error
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
     toast({
        title: "Project Updated",
        description: "The project details have been saved successfully.",
        variant: "default"
      });
      fetchProjectData(); // Refetch to show updated data if user stays on page
  }

  if (authLoading) { // Global auth loading check
    return <EditPageSkeleton />;
  }

  if (!isAdmin) { // If auth done, but not admin
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
              <Link href="/login">
                <Home />
                Go to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Admin is logged in, now check project data loading state
  if (pageLoading) {
     return <EditPageSkeleton />; // Show skeleton while project data is fetched
  }

  if (!projectData && !pageLoading) { // Project data fetch finished, but no project found
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

  // Admin logged in, project data loaded
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
