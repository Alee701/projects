
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectByIdFromFirestore, getProjectsFromFirestore } from '@/lib/firebase-admin'; // Use Admin SDK
import type { Project } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Github, ArrowLeft, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Metadata, ResolvingMetadata } from 'next';

interface ProjectDetailsPageProps {
  params: { id: string };
}

// Function to generate dynamic metadata for SEO
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

  // Create a concise description for metadata, avoiding overly long text.
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
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <Button variant="outline" asChild className="group transition-all hover:shadow-md">
            <Link href="/">
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Projects
            </Link>
        </Button>
      </div>

      <article>
        <div className="relative w-full aspect-[16/9] bg-muted rounded-xl shadow-lg overflow-hidden mb-8 border">
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

        <header className="mb-8 text-center">
            {project.isFeatured && (
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="text-amber-400 fill-amber-400" />
                    <p className="text-sm font-bold uppercase tracking-wider text-amber-500">Featured Project</p>
                </div>
            )}
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary break-words">{project.title}</h1>
        </header>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="md:col-span-2 space-y-8">
                <div>
                    <h2 className="text-2xl font-headline font-semibold mb-3 text-foreground/90 border-b pb-2">About this project</h2>
                    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line mt-4">
                        {project.description}
                    </div>
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
            </div>
             <aside className="md:col-span-1 space-y-8">
                <Card className="shadow-md rounded-xl sticky top-24">
                     <CardHeader>
                        <CardTitle className="font-headline text-xl">Project Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {project.authorName && (
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Created by</h3>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                <AvatarImage src={project.authorImageUrl} alt={project.authorName} data-ai-hint="person avatar"/>
                                <AvatarFallback>{project.authorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                <p className="font-semibold text-md text-foreground">{project.authorName}</p>
                                </div>
                            </div>
                        </div>
                        )}
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.techStack.map((tech) => (
                                    <Badge key={tech} variant="secondary" className="text-sm px-3 py-1 rounded-full">{tech}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </aside>
        </div>
      </article>
    </div>
  );
}

export async function generateStaticParams() {
  const { projects } = await getProjectsFromFirestore(); 
  return projects.map((item) => ({
    id: item.id,
  }));
}
