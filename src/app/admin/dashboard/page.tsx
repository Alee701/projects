
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
import { Home, ShieldAlert, FolderKanban, Mail, FilePlus, Loader2, Users, FileText, Star, ArrowRight, MessageSquareQuote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
             <CardContent>
               <Skeleton className="h-8 w-1/4" />
            </CardContent>
          </Card>
        ))}
      </div>
       <div className="grid gap-6 lg:grid-cols-2">
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
         <Card className="shadow-lg rounded-xl">
            <CardHeader>
            <Skeleton className="h-7 w-1/4 mb-1" />
            <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent className="grid gap-4">
               <Skeleton className="h-16 w-full" />
               <Skeleton className="h-16 w-full" />
               <Skeleton className="h-16 w-full" />
            </CardContent>
        </Card>
      </div>
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
        throw new Error(errorData.message || 'Failed to fetch submissions');
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
      } else {
        setPageLoading(false); 
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
    return Object.entries(categoryCounts).map(([name, count]) => ({ name, count })).filter(item => item.count > 0);
  }, [submissions]);

  const recentSubmissions = useMemo(() => {
    return submissions
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5);
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
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">{projects.filter(p => p.isFeatured).length} featured</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
             <p className="text-xs text-muted-foreground">from all time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.filter(s => !s.isRead).length}</div>
            <p className="text-xs text-muted-foreground">awaiting your review</p>
          </CardContent>
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
               {pageLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : submissionCategoryData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart data={submissionCategoryData} accessibilityLayer margin={{ top: 20, right: 20, left: -10, bottom: 50 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} angle={-45} textAnchor="end" interval={0}/>
                      <YAxis allowDecimals={false} />
                      <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                   <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Mail className="h-10 w-10 mb-2" />
                      <p>No submissions received yet.</p>
                   </div>
                )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Navigate to key admin sections.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/admin/manage-projects" className="group flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-all">
              <div className="flex items-center gap-4">
                <FolderKanban className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Manage Projects</h3>
                  <p className="text-sm text-muted-foreground">Edit, delete, or feature projects.</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/admin/view-submissions" className="group flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-all">
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">View Submissions</h3>
                  <p className="text-sm text-muted-foreground">Read and manage all messages.</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/submit-project" className="group flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-all">
              <div className="flex items-center gap-4">
                <FilePlus className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Add a New Project</h3>
                  <p className="text-sm text-muted-foreground">Showcase your latest work.</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>
      </div>

       <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your 5 most recent contact form submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {pageLoading ? (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
          ) : recentSubmissions.length > 0 ? (
            <div className="space-y-6">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>{submission.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{submission.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                       <MessageSquareQuote className="inline-block h-4 w-4 mr-1 text-muted-foreground/70"/>
                       {submission.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No recent activity to display.</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
