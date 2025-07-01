
"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

import { useAuth } from '@/contexts/AuthContext';
import type { ContactSubmission } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Home, Loader2, ShieldAlert, Mail, Inbox, ArrowLeft, Trash2, Search } from 'lucide-react';

const LOGIN_PATH = '/super-secret-login-page';
const submissionCategories: (ContactSubmission['category'] | 'All')[] = ['All', 'Job Inquiry', 'Collaboration', 'Feedback', 'Spam', 'General'];


function SubmissionSkeleton() {
    return (
        <div className="flex items-start gap-4 p-4 border rounded-lg animate-pulse">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="w-full space-y-2">
                <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-28 rounded-md" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-24 rounded-md" />
                </div>
                <Skeleton className="h-4 w-40 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
            </div>
        </div>
    );
}

export default function ViewSubmissionsPage() {
    const { isAdmin, isLoading: authLoading, user } = useAuth();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const { toast } = useToast();

    // New state for filtering and searching
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<ContactSubmission['category'] | 'All'>('All');

    useEffect(() => {
        if (!authLoading) {
            if (!isAdmin || !user) {
                router.replace(LOGIN_PATH + '?message=access_denied');
            } else {
                fetchSubmissions();
            }
        }
    }, [isAdmin, authLoading, user, router]);

    async function fetchSubmissions() {
        if (!user) return;
        setPageLoading(true);

        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/submissions', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                if (errorData && errorData.message) {
                    throw new Error(errorData.message);
                }
                throw new Error(`The server returned an unexpected response (status: ${response.status}). This may be due to a configuration issue.`);
            }

            const firestoreSubmissions = await response.json();
            setSubmissions(firestoreSubmissions);
        } catch (error: any) {
            toast({ title: "Error Fetching Submissions", description: `Could not fetch messages: ${error.message}`, variant: "destructive" });
            setSubmissions([]);
        } finally {
            setPageLoading(false);
        }
    }

    const handleDeleteSubmission = async (submissionId: string, submissionName: string) => {
        if (!user) return;

        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/submissions', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: submissionId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete submission.');
            }

            toast({
                title: "Submission Deleted",
                description: `The message from "${submissionName}" has been successfully removed.`,
            });
            setSubmissions(current => current.filter(s => s.id !== submissionId));

        } catch (error: any) {
            toast({
                title: "Error Deleting Submission",
                description: error.message,
                variant: "destructive",
            });
        }
    };
    
    const getCategoryVariant = (category?: ContactSubmission['category']): 'default' | 'secondary' | 'destructive' => {
        switch (category) {
            case 'Job Inquiry': return 'default';
            case 'Collaboration': return 'default';
            case 'Spam': return 'destructive';
            case 'Feedback': return 'secondary';
            case 'General': return 'secondary';
            default: return 'secondary';
        }
    };

    // Memoized filtering logic
    const filteredSubmissions = useMemo(() => {
        return submissions
            .filter(submission => activeCategory === 'All' || submission.category === activeCategory)
            .filter(submission => {
                const searchLower = searchTerm.toLowerCase();
                if (!searchLower) return true;
                return (
                    submission.name.toLowerCase().includes(searchLower) ||
                    submission.email.toLowerCase().includes(searchLower) ||
                    submission.message.toLowerCase().includes(searchLower)
                );
            });
    }, [submissions, activeCategory, searchTerm]);


    if (authLoading || (pageLoading && isAdmin)) {
        return (
            <div className="space-y-8 py-8">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-1/3" />
                </div>
                <Card className="shadow-md rounded-lg">
                    <CardHeader>
                        <Skeleton className="h-7 w-1/4 mb-1" />
                        <Skeleton className="h-5 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SubmissionSkeleton />
                        <SubmissionSkeleton />
                        <SubmissionSkeleton />
                    </CardContent>
                </Card>
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
                            You do not have permission to view this page. Please log in as an administrator.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href={LOGIN_PATH}>
                                <Home className="mr-2 h-4 w-4" /> Go to Login
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
                    <h1 className="text-3xl font-headline font-bold">Contact Submissions</h1>
                    <p className="text-muted-foreground mt-1">Messages sent from your portfolio&apos;s contact form.</p>
                </div>
            </div>

            <Card className="shadow-lg rounded-xl">
                 <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Input
                                placeholder="Search by name, email, or message..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                             {submissionCategories.map(category => (
                                category && <Button
                                    key={category}
                                    variant={activeCategory === category ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveCategory(category)}
                                    className="shrink-0"
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {submissions.length > 0 ? (
                        <Accordion type="multiple" className="w-full border-t">
                            {filteredSubmissions.length > 0 ? filteredSubmissions.map((submission) => {
                                const initials = submission.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                                return (
                                <AccordionItem value={submission.id!} key={submission.id}>
                                    <div className="group flex w-full items-center rounded-md transition-colors hover:bg-muted/50">
                                      <AccordionTrigger className="flex-grow p-4 hover:no-underline text-left w-full">
                                          <div className="flex w-full items-start justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-grow min-w-0">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback>{initials}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex items-center flex-wrap gap-2 mb-1">
                                                        <span className="font-semibold text-primary truncate">{submission.name}</span>
                                                        {submission.category && (
                                                            <Badge variant={getCategoryVariant(submission.category)} className="text-xs capitalize shrink-0">
                                                                {submission.category}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate">{submission.email}</p>
                                                    <p className="text-sm text-muted-foreground mt-1 truncate">{submission.message}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                          </div>
                                      </AccordionTrigger>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className="mr-4 shrink-0 text-destructive opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100" aria-label={`Delete message from ${submission.name}`}>
                                              <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action will permanently delete the message from &quot;{submission.name}&quot;. This cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeleteSubmission(submission.id!, submission.name)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                    <AccordionContent className="rounded-b-md bg-secondary/50 p-4 pl-16">
                                        <p className="whitespace-pre-wrap text-foreground/90">{submission.message}</p>
                                    </AccordionContent>
                                </AccordionItem>
                            )}) : (
                                <div className="flex flex-col justify-center items-center py-10 text-center">
                                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="font-semibold">No Matching Submissions</p>
                                    <p className="text-muted-foreground">Try adjusting your search or filter.</p>
                                </div>
                            )}
                        </Accordion>
                    ) : (
                        <div className="flex flex-col justify-center items-center py-10 text-center">
                            {pageLoading ? (
                                <>
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                                    <p className="text-muted-foreground">Fetching Submissions...</p>
                                </>
                            ) : (
                                <>
                                    <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                                     <p className="font-semibold">Your Inbox is Empty</p>
                                    <p className="text-muted-foreground">New submissions from your contact form will appear here.</p>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            <Button variant="outline" asChild className="mt-8 group transition-all hover:shadow-md">
                <Link href="/admin/manage-projects">
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
                    Back to Manage Projects
                </Link>
            </Button>
        </div>
    );
}

    