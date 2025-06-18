
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { mockProjects } from '@/data/projects'; // Still using mock for display
import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit3, Trash2, Home, Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { deleteProjectFromFirestore, getProjectsFromFirestore } from '@/lib/firebase'; // Placeholder functions

export default function ManageProjectsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.replace('/login?message=access_denied');
      } else {
        // Fetch projects (still using mock for now, but structure for Firebase)
        // async function fetchProjects() {
        //   const { projects: firestoreProjects, error } = await getProjectsFromFirestore();
        //   if (error) {
        //     toast({ title: "Error", description: "Could not fetch projects.", variant: "destructive" });
        //     setProjects(mockProjects); // Fallback to mock
        //   } else {
        //     // Assuming firestoreProjects matches Project type or needs mapping
        //     // setProjects(firestoreProjects as Project[]); 
        //     setProjects(mockProjects); // Using mock until Firebase read is implemented
        //   }
        //   setPageLoading(false);
        // }
        // fetchProjects();
        setProjects(mockProjects); // Using mock data for display
        setPageLoading(false);
      }
    }
  }, [isAdmin, authLoading, router, toast]);

  const handleEditProject = (projectId: string) => {
    console.log("Attempting to edit project:", projectId);
    toast({
      title: "Edit Action",
      description: `Edit functionality for project ${projectId} would be implemented here. This might involve navigating to a pre-filled form that updates Firestore.`,
    });
    // In a real app, navigate to an edit page:
    // router.push(`/admin/edit-project/${projectId}`);
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    const { error } = await deleteProjectFromFirestore(projectId);
    if (error) {
      toast({
        title: "Error Deleting Project",
        description: `Could not delete "${projectTitle}". Please try again. (Simulated)`,
        variant: "destructive",
      });
    } else {
      setProjects(currentProjects => currentProjects.filter(p => p.id !== projectId));
      toast({
        title: "Project Deleted",
        description: `Project "${projectTitle}" has been removed (Simulated).`,
      });
    }
  };

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
          <Link href="/submit-project">Add New Project</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project List</CardTitle>
          <CardDescription>View, edit, or delete existing projects. (Data is currently mock)</CardDescription>
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
                                  This action will remove the project &quot;{project.title}&quot; from the list (simulated, but would delete from Firebase). This cannot be undone.
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
            <p className="text-muted-foreground text-center py-8">No projects to display. Add projects or check Firebase connection.</p>
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
