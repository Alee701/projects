
"use client"; 

import Link from 'next/link';
import { DarkModeToggle } from './DarkModeToggle';
import { CodeXml, LayoutDashboard, FilePlus, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { isAdmin, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2" aria-label="Code with Ali Imran Home">
          <CodeXml className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold text-primary">Code with Ali Imran</span>
        </Link>
        <nav className="flex items-center space-x-2 sm:space-x-4 text-sm font-medium">
          {!isLoading && isAdmin && (
            <>
              <Link href="/" className="transition-colors hover:text-primary px-2 py-1 hidden sm:inline-block">
                Projects
              </Link>
              <Link href="/admin/manage-projects" className="transition-colors hover:text-primary px-2 py-1 flex items-center" aria-label="Manage Projects">
                <LayoutDashboard className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Manage</span>
              </Link>
              <Link href="/submit-project" className="transition-colors hover:text-primary px-2 py-1 flex items-center" aria-label="Submit Project">
                <FilePlus className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Submit</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} aria-label="Logout">
                <LogOut className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
          {/* Admin login button removed, access via direct link to /login */}
          <DarkModeToggle />
        </nav>
      </div>
    </header>
  );
}
