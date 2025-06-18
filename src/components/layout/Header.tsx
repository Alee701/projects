import Link from 'next/link';
import { DarkModeToggle } from './DarkModeToggle';
import { CodeXml } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2" aria-label="StudentFolio Home">
          <CodeXml className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold text-primary">StudentFolio</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">
            Projects
          </Link>
          <Link href="/submit-project" className="transition-colors hover:text-primary">
            Submit Project
          </Link>
          <DarkModeToggle />
        </nav>
      </div>
    </header>
  );
}
