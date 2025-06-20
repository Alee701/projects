
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchX, Home } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md text-center p-6 shadow-xl rounded-lg border-destructive/50">
        <CardHeader>
          <SearchX className="h-20 w-20 text-destructive mx-auto mb-4" />
          <p className="text-6xl font-headline font-bold text-destructive">404</p>
          <CardTitle className="font-headline text-3xl mt-2">Page Not Found</CardTitle>
          <CardDescription className="mt-2 text-lg">
            Oops! The page you were looking for could not be found. It might have been moved or deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Go back to Homepage
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
