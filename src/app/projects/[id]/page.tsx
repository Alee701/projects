
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectByIdFromFirestore, getProjectsFromFirestore } from '@/lib/firebase-admin'; // Use Admin SDK
import type { Project } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Github, Home, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Metadata, ResolvingMetadata } from 'next';

interface ProjectDetailsPageProps {
  params: { id: string };
}

// Function to generate dynamic metadata
export async function generateMetadata(
  { params }: ProjectDetailsPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const {project} = await getProjectByIdFromFirestore(params.id);

  if (!project) {
    return {
      title: 'Project Not Found',
      description: "The project you're looking for could not be found.",
    };
  }

  const description = project.description.length > 155
    ? project.description.substring(0, 152) + '...'
    : project.description;

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: project.title,
    description: description,
    openGraph: {
      title: project.title,
      description: description,
      images: [
        {
          url: project.imageUrl,
          width: 1200,
          height: 630,
          alt: `${project.title} screenshot`,
        },
        ...previousImages,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: description,
      images: [project.imageUrl],
    }
  };
}


export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const {project} = await getProjectByIdFromFirestore(params.id);

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
          <div className="relative w-full aspect-[16/9] mb-6 bg-muted/30">
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
            
            {project.authorName && (
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={project.authorImageUrl} alt={project.authorName} data-ai-hint="person avatar"/>
                  <AvatarFallback>{project.authorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg text-foreground">Created by</p>
                  <p className="text-muted-foreground -mt-1">{project.authorName}</p>
                </div>
              </div>
            )}
            
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
  const { projects } = await getProjectsFromFirestore(); 
  return projects.map((item) => ({
    id: item.id,
  }));
}
