
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

import { useAuth } from '@/contexts/AuthContext';
import type { ContactSubmission } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Home, Loader2, ShieldAlert, Mail, Inbox, ArrowLeft, Trash2, Search, MoreHorizontal, RefreshCw } from 'lucide-react';

const LOGIN_PATH = '/super-secret-login-page';

function MailboxSkeleton() {
    return (
        <div className="space-y-4 py-8">
             <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-64" />
            </div>
            <Card className="shadow-lg rounded-xl">
                <div className="flex items-center justify-between p-4 border-b">
                     <div className="flex items-center gap-4">
                        <Skeleton className="h-5 w-5 rounded-sm" />
                        <Skeleton className="h-9 w-24 rounded-md" />
                     </div>
                     <Skeleton className="h-9 w-40 rounded-md" />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                             <TableHead className="w-[50px] p-2"><Checkbox disabled className="translate-y-[2px]" /></TableHead>
                             <TableHead className="w-[250px]">Sender</TableHead>
                             <TableHead>Message</TableHead>
                             <TableHead className="w-[150px] text-right">Received</TableHead>
                             <TableHead className="w-[50px] text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Checkbox disabled /></TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="grid gap-1">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-5 w-1/4" />
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-2/3 ml-auto" /></TableCell>
                                <TableCell className="text-center"><MoreHorizontal className="text-muted-foreground" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

export default function ViewSubmissionsPage() {
    const { isAdmin, isLoading: authLoading, user } = useAuth();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const { toast } = useToast();

    // Mailbox state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [viewingSubmission, setViewingSubmission] = useState<ContactSubmission | null>(null);

    const fetchSubmissions = useCallback(async (showLoadingSpinner = true) => {
        if (!user) return;
        if (showLoadingSpinner) {
            setPageLoading(true);
        }
        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/submissions', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'An unknown server error occurred.' }));
                throw new Error(errorData.message);
            }
            const data = await response.json();
            setSubmissions(data);
        } catch (error: any) {
            toast({ title: "Error Fetching Submissions", description: error.message, variant: "destructive" });
            setSubmissions([]);
        } finally {
            if (showLoadingSpinner) {
                setPageLoading(false);
            }
        }
    }, [user, toast]);

    useEffect(() => {
        if (!authLoading) {
            if (isAdmin && user) {
                fetchSubmissions();
            } else {
                router.replace(LOGIN_PATH + '?message=access_denied');
            }
        }
    }, [isAdmin, authLoading, user, router, fetchSubmissions]);

    const handleMarkAsRead = async (submissionId: string) => {
        if (!user) return;
        setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, isRead: true } : s));
        try {
            const token = await user.getIdToken();
            await fetch('/api/submissions', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: submissionId, updates: { isRead: true } }),
            });
        } catch (error) {
            setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, isRead: false } : s));
            toast({ title: "Error", description: "Could not mark message as read.", variant: "destructive" });
        }
    };

    const handleViewSubmission = (submission: ContactSubmission) => {
        setViewingSubmission(submission);
        if (!submission.isRead) {
            handleMarkAsRead(submission.id!);
        }
    };

    const handleDeleteSubmissions = async (submissionIds: string[]) => {
        if (!user || submissionIds.length === 0) return;
        const originalSubmissions = [...submissions];
        const remainingSubmissions = submissions.filter(s => !submissionIds.includes(s.id!));
        setSubmissions(remainingSubmissions);
        setSelectedIds([]);
        if (viewingSubmission && submissionIds.includes(viewingSubmission.id!)) {
            setViewingSubmission(null);
        }
        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/submissions', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: submissionIds }),
            });
            if (!response.ok) throw new Error('Failed to delete on server.');
            toast({ title: "Submissions Deleted", description: `${submissionIds.length} message(s) have been removed.` });
        } catch (error) {
            setSubmissions(originalSubmissions);
            toast({ title: "Error", description: "Could not delete submissions. Reverting changes.", variant: "destructive" });
        }
    };

    const filteredSubmissions = useMemo(() => {
        return submissions.filter(s => {
            const search = searchTerm.toLowerCase();
            return !search || s.name.toLowerCase().includes(search) || s.email.toLowerCase().includes(search) || s.message.toLowerCase().includes(search) || s.category?.toLowerCase().includes(search);
        }).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }, [submissions, searchTerm]);
    
    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedIds(filteredSubmissions.map(s => s.id!));
        } else {
            setSelectedIds([]);
        }
    };
    
    const handleSelectOne = (id: string, checked: boolean) => {
        setSelectedIds(prev => checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id));
    };

    const getCategoryVariant = (category?: ContactSubmission['category']): 'default' | 'secondary' | 'destructive' => {
        switch (category) {
            case 'Job Inquiry': return 'default';
            case 'Collaboration': return 'default';
            case 'Spam': return 'destructive';
            default: return 'secondary';
        }
    };

    if (authLoading || (pageLoading && isAdmin)) return <MailboxSkeleton />;

    if (!isAdmin) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                <Card className="w-full max-w-md text-center p-6 shadow-xl rounded-lg">
                    <CardHeader><ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-2" /><CardTitle className="font-headline text-2xl">Access Denied</CardTitle><CardDescription>You do not have permission to view this page.</CardDescription></CardHeader>
                    <CardContent><Button asChild><Link href={LOGIN_PATH}><Home /> Go to Login</Link></Button></CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 py-8">
             <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-headline font-bold">Inbox</h1>
                    <p className="text-muted-foreground mt-1">You have {submissions.filter(s => !s.isRead).length} unread messages.</p>
                </div>
                 <Button variant="outline" asChild className="group transition-all hover:shadow-md">
                    <Link href="/admin/dashboard"><ArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" /> Back to Dashboard</Link>
                </Button>
            </div>

            <Card className="shadow-xl rounded-xl">
                <div className="flex items-center gap-2 p-4 border-b">
                    <div className="flex items-center gap-2">
                        <Checkbox id="select-all" onCheckedChange={handleSelectAll} checked={selectedIds.length === filteredSubmissions.length && filteredSubmissions.length > 0 ? true : selectedIds.length > 0 ? 'indeterminate' : false} />
                        {selectedIds.length > 0 ? (
                            <Button variant="outline" size="sm" onClick={() => handleDeleteSubmissions(selectedIds)}><Trash2 /> Delete ({selectedIds.length})</Button>
                        ) : (
                            <Button variant="outline" size="sm" onClick={() => fetchSubmissions(false)} disabled={pageLoading}><RefreshCw className={pageLoading ? 'animate-spin' : ''} /> Refresh</Button>
                        )}
                    </div>
                    <div className="relative ml-auto flex-1 md:grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search messages..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-full md:w-[250px] lg:w-[300px]" />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] p-2"><Checkbox disabled className="translate-y-[2px]" /></TableHead>
                                <TableHead className="w-[250px]">Sender</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead className="w-[150px] text-right">Received</TableHead>
                                <TableHead className="w-[50px] text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSubmissions.length > 0 ? filteredSubmissions.map((submission) => (
                                <TableRow key={submission.id} data-state={selectedIds.includes(submission.id!) ? 'selected' : ''} className={cn(!submission.isRead && "font-bold", "cursor-pointer")}>
                                    <TableCell className="w-[50px] p-2" onClick={(e) => e.stopPropagation()}><Checkbox onCheckedChange={(checked) => handleSelectOne(submission.id!, !!checked)} checked={selectedIds.includes(submission.id!)} /></TableCell>
                                    <TableCell className="w-[250px] max-w-[250px] truncate" onClick={() => handleViewSubmission(submission)}>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 hidden sm:flex"><AvatarFallback>{submission.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                                            <div className="grid gap-0.5"><div className="truncate">{submission.name}</div><div className="text-xs text-muted-foreground truncate font-normal">{submission.email}</div></div>
                                        </div>
                                    </TableCell>
                                    <TableCell onClick={() => handleViewSubmission(submission)}>
                                        <div className="flex items-center gap-2 max-w-md lg:max-w-xl truncate">
                                            {submission.category && <Badge variant={getCategoryVariant(submission.category)} className="capitalize font-medium hidden md:inline-flex">{submission.category}</Badge>}
                                            <span className="text-muted-foreground font-normal truncate">{submission.message}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[150px] text-right text-muted-foreground font-normal" onClick={() => handleViewSubmission(submission)}>{formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}</TableCell>
                                    <TableCell className="w-[50px] text-center" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleDeleteSubmissions([submission.id!])} className="text-destructive focus:text-destructive"><Trash2 /> Delete</DropdownMenuItem></DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground"><Inbox className="mx-auto h-8 w-8 mb-2" />No messages found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <Dialog open={!!viewingSubmission} onOpenChange={(isOpen) => !isOpen && setViewingSubmission(null)}>
                <DialogContent className="max-w-3xl">
                    {viewingSubmission && (<>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-headline">{viewingSubmission.category && <Badge variant={getCategoryVariant(viewingSubmission.category)} className="capitalize mr-2 align-middle">{viewingSubmission.category}</Badge>} Message from {viewingSubmission.name}</DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground pt-2">
                                Received on {format(new Date(viewingSubmission.submittedAt), "PPPp")}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 whitespace-pre-wrap text-foreground/90 leading-relaxed border-t border-b">
                            {viewingSubmission.message}
                        </div>
                        <DialogFooter className="sm:justify-between">
                            <div className="text-sm">
                                <p className="font-semibold">{viewingSubmission.name}</p>
                                <a href={`mailto:${viewingSubmission.email}`} className="text-primary hover:underline">{viewingSubmission.email}</a>
                            </div>
                            <div className="flex gap-2 mt-4 sm:mt-0">
                                <Button variant="destructive" onClick={() => handleDeleteSubmissions([viewingSubmission.id!])}><Trash2 /> Delete</Button>
                                <Button asChild><a href={`mailto:${viewingSubmission.email}?subject=Re: Your message`}><Mail /> Reply</a></Button>
                            </div>
                        </DialogFooter>
                    </>)}
                </DialogContent>
            </Dialog>
        </div>
    );
}
