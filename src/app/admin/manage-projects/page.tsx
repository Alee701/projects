
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
import { Edit3, Trash2, Home, Loader2, ShieldAlert, PlusCircle, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getProjectsFromFirestore } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { deleteProject } from '@/ai/flows/delete-project-flow';

const LOGIN_PATH = '/super-secret-login-page';

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
        router.replace(LOGIN_PATH + '?message=access_denied');
      } else {
        fetchProjects();
      }
    }
  }, [isAdmin, authLoading, user, router]);

  async function fetchProjects() {
    setPageLoading(true);
    const { projects: firestoreProjects, error } = await getProjectsFromFirestore();
    if (error) {
      toast({ title: "Error Fetching Projects", description: `Could not fetch projects: ${error.message}`, variant: "destructive" });
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
    try {
      const result = await deleteProject({ projectId });
      if (result.success) {
        setProjects(currentProjects => currentProjects.filter(p => p.id !== projectId));
        toast({
          title: "Project Deleted",
          description: `Project "${projectTitle}" has been successfully removed.`,
          variant: "default",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
       toast({
        title: "Error Deleting Project",
        description: `Could not delete "${projectTitle}". Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  if (authLoading || (pageLoading && isAdmin)) { 
    return (
      <div className="space-y-8 py-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
        <Card className="shadow-md rounded-lg">
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
                  {[...Array(3)].map((_, i) => <ProjectRowSkeleton key={i} />)}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-10 w-44 rounded-md" />
      </div>
    );
  }

  if (!isAdmin) { 
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md text-center p-6 shadow-xl rounded-lg">
          <CardHeader>
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle className="font-headline text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to manage projects. Please log in as an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={LOGIN_PATH}>
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
    <div className="space-y-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline font-bold">Manage Projects</h1>
        <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
          <Link href="/submit-project">
            <PlusCircle /> Add New Project
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Project List</CardTitle>
          <CardDescription>View, edit, or delete existing projects from Firestore.</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
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
                    <TableRow key={project.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                        {project.description.substring(0, 100)}{project.description.length > 100 ? '...' : ''}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {project.techStack.slice(0, 3).map(tech => ( 
                            <span key={tech} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 3 && (
                             <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">...</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 sm:gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProject(project.id)}
                            aria-label={`Edit ${project.title}`}
                            className="hover:text-primary transition-colors"
                          >
                            <Edit3 />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 transition-colors" aria-label={`Delete ${project.title}`}>
                                <Trash2 />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently delete the project &quot;{project.title}&quot; from Firestore and its associated image from Cloudinary. This cannot be undone.
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
             pageLoading && !authLoading ? ( 
              <div className="flex flex-col justify-center items-center py-10 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                  <p className="text-muted-foreground">Fetching Projects...</p>
              </div>
            ) : ( 
              <p className="text-muted-foreground text-center py-8">No projects found in Firestore. Click &quot;Add New Project&quot; to get started.</p>
            )
          )}
        </CardContent>
      </Card>
       <Button variant="outline" asChild className="mt-8 group transition-all hover:shadow-md">
        <Link href="/">
          <Home className="group-hover:scale-110 transition-transform duration-300" />
          Back to Homepage
        </Link>
      </Button>
    </div>
  );
}

    
