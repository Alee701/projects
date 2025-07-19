
import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const hasLiveDemo = project.liveDemoUrl && project.liveDemoUrl !== '#';
  const hasGithubRepo = project.githubUrl && project.githubUrl !== '#';

  return (
    <Card className={cn(
        "flex flex-col overflow-hidden transition-all duration-300 ease-in-out group border rounded-lg",
        "shadow-lg hover:shadow-2xl hover:-translate-y-2",
        "bg-card/80 backdrop-blur-sm",
        "relative",
        "before:absolute before:inset-0 before:rounded-lg before:opacity-0 before:transition-opacity before:duration-300",
        "before:bg-gradient-to-tr before:from-primary/10 before:via-transparent before:to-accent/10",
        "hover:before:opacity-100",
        "before:pointer-events-none" // Fix: Prevent the overlay from capturing mouse events
    )}>
      <div className="relative z-10 flex flex-col h-full"> {/* Fix: Add z-index to content */}
        <CardHeader className="p-0">
          <Link href={`/projects/${project.id}`} className="block" passHref>
            <div className="aspect-video relative w-full overflow-hidden rounded-t-lg bg-muted/30">
              <Image
                src={project.imageUrl}
                alt={`${project.title} thumbnail`}
                fill
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                data-ai-hint="project showcase application"
              />
            </div>
          </Link>
        </CardHeader>
        <CardContent className="p-6 flex-grow">
          <Link href={`/projects/${project.id}`} className="block mb-2" passHref>
            <CardTitle className="font-headline text-2xl hover:text-primary transition-colors duration-300">
              {project.title}
            </CardTitle>
          </Link>
          <div className="mt-1 mb-3 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs px-2 py-0.5">{tech}</Badge>
            ))}
          </div>
          <CardDescription className="line-clamp-3 text-sm text-muted-foreground">
            {project.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex flex-col items-start gap-4">
          {project.authorName && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={project.authorImageUrl} alt={project.authorName} data-ai-hint="person avatar" />
                <AvatarFallback>{project.authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-muted-foreground">{project.authorName}</span>
            </div>
          )}
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {hasGithubRepo && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={project.githubUrl!} target="_blank" rel="noopener noreferrer">
                    <Github /> GitHub
                  </Link>
                </Button>
              )}
              {hasLiveDemo && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={project.liveDemoUrl!} target="_blank" rel="noopener noreferrer">
                    <ExternalLink /> Live Demo
                  </Link>
                </Button>
              )}
            </div>
            <Button size="sm" asChild className="group/details w-full sm:w-auto mt-2 sm:mt-0">
              <Link href={`/projects/${project.id}`}>
                Details <ArrowRight className="transition-transform group-hover/details:translate-x-1" />
              </Link>
            </Button>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
