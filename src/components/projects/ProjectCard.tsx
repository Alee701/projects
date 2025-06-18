import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-xl">
      <CardHeader>
        <Link href={`/projects/${project.id}`} className="block hover:text-primary transition-colors">
          <CardTitle className="font-headline text-2xl">{project.title}</CardTitle>
        </Link>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <Badge key={tech} variant="secondary">{tech}</Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Link href={`/projects/${project.id}`} className="block">
          <div className="aspect-video relative w-full overflow-hidden rounded-md mb-4">
            <Image
              src={project.imageUrl}
              alt={`${project.title} thumbnail`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="project screenshot"
            />
          </div>
        </Link>
        <CardDescription className="line-clamp-3">
          {project.description}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/projects/${project.id}`}>
            View Details
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
