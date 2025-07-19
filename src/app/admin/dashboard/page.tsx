
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { ContactSubmission, Project } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { getProjectsFromFirestore } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Home, ShieldAlert, FolderKanban, Mail, FilePlus } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

const LOGIN_PATH = '/super-secret-login-page';

const chartConfig = {
  count: {
    label: "Messages",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

function DashboardSkeleton() {
  return (
    <div className="space-y-8 py-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-1/3" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/4" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <Skeleton className="h-7 w-1/4 mb-1" />
          <Skeleton className="h-5 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="aspect-[16/9] w-full">
            <Skeleton className="w-full h-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setPageLoading(true);

    try {
      const { projects: firestoreProjects, error: projectsError } = await getProjectsFromFirestore();
      if (projectsError) {
        toast({ title: "Error Fetching Projects", description: `Could not fetch projects: ${projectsError.message}`, variant: "destructive" });
      } else {
        setProjects(firestoreProjects as Project[]);
      }

      const token = await user.getIdToken();
      const response = await fetch('/api/submissions', { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown server error occurred.' }));
        throw new Error(errorData.message);
      }
      
      const data = await response.json();
      setSubmissions(data);

    } catch (error: any) {
      toast({ title: "Error Fetching Data", description: error.message, variant: "destructive" });
    } finally {
      setPageLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.replace(LOGIN_PATH + '?message=access_denied');
      } else if (user) {
        fetchData();
      }
    }
  }, [isAdmin, authLoading, user, router, fetchData]);

  const submissionCategoryData = useMemo(() => {
    const categoryCounts: { [key: string]: number } = {
      'General': 0, 'Job Inquiry': 0, 'Collaboration': 0, 'Feedback': 0, 'Spam': 0
    };
    submissions.forEach(s => {
      const category = s.category || 'General';
      if (category in categoryCounts) {
        categoryCounts[category]++;
      }
    });
    return Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
  }, [submissions]);

  if (authLoading || (pageLoading && isAdmin)) {
    return <DashboardSkeleton />;
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md text-center p-6 shadow-xl rounded-lg">
          <CardHeader>
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle className="font-headline text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to view the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={LOGIN_PATH}>
                <Home /> Go to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.displayName || user?.email}!</p>
        </div>
        <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
          <Link href="/submit-project">
            <FilePlus /> Add New Project
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            <p className="text-2xl font-bold">{projects.length}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
            <p className="text-2xl font-bold">{submissions.length}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Unread Messages</CardTitle>
            <p className="text-2xl font-bold">{submissions.filter(s => !s.isRead).length}</p>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Message Categories</CardTitle>
            <CardDescription>Breakdown of contact form submissions by category.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-[16/9] w-full">
              <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart data={submissionCategoryData} accessibilityLayer margin={{ top: 20, right: 20, left: -10, bottom: 50 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} angle={-45} textAnchor="end" interval={0}/>
                  <YAxis />
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg rounded-xl">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Navigate to key admin sections.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Button asChild size="lg" variant="outline">
                    <Link href="/admin/manage-projects" className="justify-start">
                        <FolderKanban /> Manage Projects
                    </Link>
                </Button>
                 <Button asChild size="lg" variant="outline">
                    <Link href="/admin/view-submissions" className="justify-start">
                        <Mail /> View Submissions
                    </Link>
                </Button>
                 <Button asChild size="lg" variant="outline">
                    <Link href="/submit-project" className="justify-start">
                        <FilePlus /> Add a New Project
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
