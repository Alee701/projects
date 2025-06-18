
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { mockProjects } from '@/data/projects';
import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit3, Trash2, Home } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// TEMPORARY: Simulate admin status. This should match the flag in Header.tsx for consistent behavior.
// Change this to `true` to test admin access to this page.
const IS_ADMIN_TEMPORARY_FLAG = false;

export default function ManageProjectsPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate checking admin status.
    setIsAdmin(IS_ADMIN_TEMPORARY_FLAG);
    if (IS_ADMIN_TEMPORARY_FLAG) {
      setProjects(mockProjects); // Load initial projects if admin
    }
  }, []);

  const handleEditProject = (projectId: string) => {
    console.log("Attempting to edit project:", projectId);
    toast({
      title: "Edit Action",
      description: `Edit functionality for project ${projectId} would be implemented here. This might involve navigating to a pre-filled form.`,
    });
    // In a real app, you might navigate to an edit page:
    // router.push(`/admin/edit-project/${projectId}`);
  };

  const handleDeleteProject = (projectId: string) => {
    // Simulate deletion by filtering the project out of the local state
    setProjects(currentProjects => currentProjects.filter(p => p.id !== projectId));
    console.log("Simulated deletion of project:", projectId);
    toast({
      title: "Project Deleted (Simulated)",
      description: `Project "${projectId}" has been removed from the view. This is a client-side simulation.`,
      variant: "destructive",
    });
  };

  if (isAdmin === null) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-muted-foreground">Loading access permissions...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to manage projects. Please contact an administrator if you believe this is an error.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Return to Homepage
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
          <CardDescription>View, edit, or delete existing projects.</CardDescription>
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
                                  This action will remove the project from the list (simulated). This is not a permanent deletion from the data source in this demo.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProject(project.id)}
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
            <p className="text-muted-foreground text-center py-8">No projects to display. The original project list might be empty or all projects have been (simulated) deleted.</p>
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
