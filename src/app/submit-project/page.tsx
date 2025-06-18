"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProjectForm from '@/components/projects/ProjectForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// TEMPORARY: Simulate admin status. In a real app, this would come from an authentication context/state.
// This should match the flag in Header.tsx for consistent behavior.
// Change this to `true` to test admin access to this page.
const IS_ADMIN_TEMPORARY_FLAG = false;

export default function SubmitProjectPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // Simulate checking admin status.
    // In a real application, you would fetch this from your auth provider or context.
    setIsAdmin(IS_ADMIN_TEMPORARY_FLAG);
  }, []);

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
              You do not have permission to submit new projects. Please contact an administrator if you believe this is an error.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">Return to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <ProjectForm />
    </div>
  );
}
