
"use client";

import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t bg-secondary/30 dark:bg-secondary/10 mt-12">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <p className="text-sm leading-loose text-muted-foreground">
            Built by Code with Ali Imran. &copy; {currentYear} All rights reserved.
            </p>
        </div>
        <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
                <Link href="https://github.com/Alee701" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <Github className="h-5 w-5" />
                </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
                <Link href="https://www.linkedin.com/in/ali-imran-co" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <Linkedin className="h-5 w-5" />
                </Link>
            </Button>
        </div>
      </div>
    </footer>
  );
}
