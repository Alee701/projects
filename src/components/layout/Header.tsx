
"use client"; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DarkModeToggle } from './DarkModeToggle';
import { CodeXml, LayoutDashboard, FilePlus, LogOut, Menu, Mail, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const { isAdmin, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2 group" aria-label="Code with Ali Imran Home">
          <CodeXml className="h-7 w-7 text-primary transition-transform duration-300 group-hover:rotate-[15deg]" />
          <span className="font-headline text-xl font-bold text-primary hidden sm:inline-block">Code with Ali Imran</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
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
          
          {!isLoading && isAdmin && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/admin/dashboard" className="transition-colors hover:text-primary flex items-center" aria-label="Dashboard">
                  <BarChart3 />
                  <span>Dashboard</span>
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/admin/manage-projects" className="transition-colors hover:text-primary flex items-center" aria-label="Manage Projects">
                  <LayoutDashboard />
                  <span>Manage</span>
                </Link>
              </Button>
               <Button variant="ghost" asChild>
                <Link href="/admin/view-submissions" className="transition-colors hover:text-primary flex items-center" aria-label="View Submissions">
                  <Mail />
                  <span>Submissions</span>
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/submit-project" className="transition-colors hover:text-primary flex items-center" aria-label="Submit Project">
                  <FilePlus />
                  <span>Submit</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={logout} aria-label="Logout" className="hover:text-destructive transition-colors">
                <LogOut />
                <span>Logout</span>
              </Button>
            </>
          )}

          <DarkModeToggle />
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open mobile menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs p-6">
              <SheetHeader>
                <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
              </SheetHeader>
              <Link href="/" className="flex items-center space-x-2 mb-6" onClick={() => setIsSheetOpen(false)}>
                <CodeXml className="h-7 w-7 text-primary" />
                <span className="font-headline text-xl font-bold text-primary">Code with Ali Imran</span>
              </Link>
              <Separator />
              <div className="flex flex-col space-y-2 mt-6">
                {navLinks.map((link) => (
                  <Button key={`mobile-${link.href}`} variant="ghost" asChild className="justify-start text-lg">
                    <Link
                      href={link.href}
                      onClick={() => setIsSheetOpen(false)}
                      className={cn(
                        pathname === link.href ? "text-primary font-semibold" : ""
                      )}
                    >
                      {link.label}
                    </Link>
                  </Button>
                ))}
                {!isLoading && isAdmin && (
                  <>
                    <Separator className="my-2" />
                    <h3 className="px-4 py-2 text-sm font-semibold text-muted-foreground">Admin</h3>
                     <Button variant="ghost" asChild className="justify-start">
                        <Link href="/admin/dashboard" onClick={() => setIsSheetOpen(false)}>
                            <BarChart3 /> Dashboard
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start">
                        <Link href="/admin/manage-projects" onClick={() => setIsSheetOpen(false)}>
                            <LayoutDashboard /> Manage Projects
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start">
                        <Link href="/admin/view-submissions" onClick={() => setIsSheetOpen(false)}>
                            <Mail /> View Submissions
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start">
                        <Link href="/submit-project" onClick={() => setIsSheetOpen(false)}>
                            <FilePlus /> Submit Project
                        </Link>
                    </Button>
                    <Button variant="ghost" onClick={() => { logout(); setIsSheetOpen(false); }} className="justify-start text-destructive hover:text-destructive">
                        <LogOut /> Logout
                    </Button>
                  </>
                )}
              </div>
              <div className="absolute bottom-6 right-6">
                <DarkModeToggle />
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}
