
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit3, Trash2, Home, Loader2, ShieldAlert, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { deleteProjectFromFirestore, getProjectsFromFirestore } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

function ProjectRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="w-[200px]"><Skeleton className="h-5 w-3/4" /></TableCell>
      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </TableCell>
      <TableCell className="text-right w-[120px]">
        <div className="flex gap-2 justify-end">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function ManageProjectsPage() {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin || !user) {
        router.replace('/login?message=access_denied');
      } else {
        fetchProjects();
      }
    }
  }, [isAdmin, authLoading, user, router]);

  async function fetchProjects() {
    setPageLoading(true);
    const { projects: firestoreProjects, error } = await getProjectsFromFirestore();
    if (error) {
      toast({ title: "Error", description: "Could not fetch projects from Firestore.", variant: "destructive" });
      setProjects([]);
    } else {
      setProjects(firestoreProjects as Project[]);
    }
    setPageLoading(false);
  }

  const handleEditProject = (projectId: string) => {
    router.push(`/admin/edit-project/${projectId}`);
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    const { error } = await deleteProjectFromFirestore(projectId);
    if (error) {
      toast({
        title: "Error Deleting Project",
        description: `Could not delete "${projectTitle}" from Firestore. Error: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setProjects(currentProjects => currentProjects.filter(p => p.id !== projectId));
      toast({
        title: "Project Deleted",
        description: `Project "${projectTitle}" has been removed from Firestore.`,
        variant: "default" 
      });
    }
  };

  if (authLoading || (pageLoading && !projects.length && isAdmin)) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-1/4 mb-1" />
            <Skeleton className="h-5 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Title</TableHead>
                    <TableHead>Description (Snippet)</TableHead>
                    <TableHead>Tech Stack</TableHead>
                    <TableHead className="text-right w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <ProjectRowSkeleton />
                  <ProjectRowSkeleton />
                  <ProjectRowSkeleton />
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-10 w-44" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle className="font-headline text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to manage projects. Please log in as an administrator.
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Manage Projects</h1>
        <Button asChild>
          <Link href="/submit-project">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Project
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project List</CardTitle>
          <CardDescription>View, edit, or delete existing projects from Firestore.</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Title</TableHead>
                    <TableHead>Description (Snippet)</TableHead>
                    <TableHead>Tech Stack</TableHead>
                    <TableHead className="text-right w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                        {project.description.substring(0, 100)}{project.description.length > 100 ? '...' : ''}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {project.techStack.map(tech => (
                            <span key={tech} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProject(project.id)}
                            aria-label={`Edit ${project.title}`}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={`Delete ${project.title}`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently delete the project &quot;{project.title}&quot; from Firestore. This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProject(project.id, project.title)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             pageLoading ? (
              <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Fetching Projects...</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No projects found in Firestore. Click &quot;Add New Project&quot; to get started.</p>
            )
          )}
        </CardContent>
      </Card>
       <Button variant="outline" asChild className="mt-8">
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Back to Homepage
        </Link>
      </Button>
    </div>
  );
}
