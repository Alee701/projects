
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectById, getAllProjectIds } from '@/data/projects';
import type { Project } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Github, Home, ArrowLeft } from 'lucide-react';

interface ProjectDetailsPageProps {
  params: { id: string };
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const project: Project | undefined = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Button variant="outline" asChild className="mb-8 group transition-all hover:shadow-md">
        <Link href="/">
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Projects
        </Link>
      </Button>

      <Card className="overflow-hidden shadow-lg rounded-xl">
        <CardHeader className="p-0">
          <div className="relative w-full aspect-[16/9] mb-6">
            <Image
              src={project.imageUrl || 'https://placehold.co/1200x675.png'}
              alt={`${project.title} main image`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px"
              data-ai-hint="project showcase application"
            />
          </div>
          <div className="p-6 md:p-8">
            <CardTitle className="font-headline text-3xl sm:text-4xl md:text-5xl mb-4 text-primary">{project.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mb-6">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-sm px-3 py-1 rounded-full">{tech}</Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0">
          <h2 className="text-2xl font-headline font-semibold mb-3 text-foreground/90">About this project</h2>
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line mb-8">
            {project.description}
          </div>
          
          <div className="flex flex-wrap gap-4">
            {project.liveDemoUrl && project.liveDemoUrl !== '#' && (
              <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                <Link href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink />
                  Live Demo
                </Link>
              </Button>
            )}
            {project.githubUrl && project.githubUrl !== '#' && (
              <Button variant="secondary" size="lg" asChild className="shadow-md hover:shadow-lg transition-shadow">
                <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github />
                  GitHub Repository
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export async function generateStaticParams() {
  const projectIds = await getAllProjectIds(); 
  return projectIds.map((item) => ({
    id: item.id,
  }));
}
