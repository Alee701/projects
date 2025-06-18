
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectById, getAllProjectIds } from '@/data/projects'; // Updated imports
import type { Project } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Github, Home } from 'lucide-react';

// Revalidate this page every 60 seconds (or adjust as needed)
// export const revalidate = 60; 

// Props for the page component
interface ProjectDetailsPageProps {
  params: { id: string };
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  // Fetch project data server-side using the ID from params
  const project: Project | undefined = await getProjectById(params.id);

  if (!project) {
    notFound(); // Triggers the 404 page if project isn't found
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="outline" asChild className="mb-8">
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <CardHeader className="p-0">
          <div className="relative w-full aspect-[16/9] mb-6">
            <Image
              src={project.imageUrl || 'https://placehold.co/800x450.png'} // Fallback image
              alt={`${project.title} main image`}
              fill
              className="object-cover"
              priority
              data-ai-hint="project showcase"
            />
          </div>
          <div className="p-6">
            <CardTitle className="font-headline text-4xl mb-4">{project.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mb-6">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-sm px-3 py-1">{tech}</Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <h2 className="text-2xl font-headline font-semibold mb-3">About this project</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line mb-8">
            {project.description}
          </p>
          
          <div className="flex flex-wrap gap-4">
            {project.liveDemoUrl && project.liveDemoUrl !== '#' && (
              <Button asChild>
                <Link href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Live Demo
                </Link>
              </Button>
            )}
            {project.githubUrl && project.githubUrl !== '#' && (
              <Button variant="secondary" asChild>
                <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
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

// generateStaticParams will pre-render pages at build time for existing project IDs
export async function generateStaticParams() {
  const projectIds = await getAllProjectIds(); // Fetch all project IDs from Firestore
  return projectIds.map((item) => ({
    id: item.id,
  }));
}
