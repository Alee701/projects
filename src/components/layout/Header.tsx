"use client"; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DarkModeToggle } from './DarkModeToggle';
import { CodeXml, LayoutDashboard, FilePlus, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Me' },
  { href: '/contact', label: 'Contact Me' },
];

export default function Header() {
  const { isAdmin, logout, isLoading } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2 group" aria-label="Code with Ali Imran Home">
          <CodeXml className="h-7 w-7 text-primary transition-transform duration-300 group-hover:rotate-[15deg]" />
          <span className="font-headline text-xl font-bold text-primary hidden sm:inline-block">Code with Ali Imran</span>
        </Link>
        
        <nav className="flex items-center space-x-1 sm:space-x-2 text-sm font-medium">
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Button key={link.href} variant="ghost" asChild>
                <Link
                  href={link.href}
                  className={cn(
                    "transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary font-semibold" : ""
                  )}
                >
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>
          
          {!isLoading && isAdmin && (
            <>
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
          )}

          <DarkModeToggle />
        </nav>
      </div>
    </header>
  );
}
