
"use client"; 

import Link from 'next/link';
import { DarkModeToggle } from './DarkModeToggle';
import { CodeXml, LayoutDashboard, FilePlus, LogOut, Home, BookOpenCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { isAdmin, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2 group" aria-label="Code with Ali Imran Home">
          <CodeXml className="h-7 w-7 text-primary transition-transform duration-300 group-hover:rotate-[15deg]" />
          <span className="font-headline text-xl font-bold text-primary hidden sm:inline-block">Code with Ali Imran</span>
        </Link>
        
        <nav className="flex items-center space-x-1 sm:space-x-2 text-sm font-medium">
          {!isLoading && isAdmin ? (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/" className="transition-colors hover:text-primary">
                  <Home /> Projects
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/admin/manage-projects" className="transition-colors hover:text-primary flex items-center" aria-label="Manage Projects">
                  <LayoutDashboard />
                  <span className="hidden sm:inline">Manage</span>
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/submit-project" className="transition-colors hover:text-primary flex items-center" aria-label="Submit Project">
                  <FilePlus />
                  <span className="hidden sm:inline">Submit</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={logout} aria-label="Logout" className="hover:text-destructive transition-colors">
                <LogOut />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
             <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/" className="transition-colors hover:text-primary">
                  <BookOpenCheck /> Projects
                </Link>
              </Button>
          )}
          <DarkModeToggle />
        </nav>
      </div>
    </header>
  );
}
