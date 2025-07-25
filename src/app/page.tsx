
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProjectGrid from '@/components/projects/ProjectGrid';
import ProjectFilter from '@/components/projects/ProjectFilter';
import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Loader2, Database, Server, Component, Code2, ExternalLink, Star } from 'lucide-react';
import { getProjectsFromFirestore } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import ProjectCardSkeleton from '@/components/projects/ProjectCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";


const iconVariant = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'backOut' } },
};

const techIcons = [
  { icon: Database, name: 'MongoDB' },
  { icon: Server, name: 'Express.js' },
  { icon: Component, name: 'React' },
  { icon: Code2, name: 'Node.js' }
];

const PROJECTS_PER_PAGE = 9;

function FeaturedProjectSection({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) return null;

  // Single Featured Project
  if (projects.length === 1) {
    const project = projects[0];
    return (
      <motion.div 
        className="relative rounded-xl border bg-card text-card-foreground shadow-xl overflow-hidden my-12 group"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
        <div className="grid md:grid-cols-2 relative">
          <div className="p-8 md:p-12 order-2 md:order-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                  <Star className="text-amber-400 fill-amber-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500">Featured Project</h3>
              </div>
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-4">{project.title}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
              <p className="text-muted-foreground mb-6 line-clamp-4">{project.description}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                  {project.liveDemoUrl && (
                    <Button asChild>
                      <Link href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink /> Live Demo
                      </Link>
                    </Button>
                  )}
                  <Button variant="secondary" asChild>
                    <Link href={`/projects/${project.id}`}>
                      <ArrowRight /> View Details
                    </Link>
                  </Button>
              </div>
          </div>
          <div className="relative aspect-video md:aspect-auto order-1 md:order-2 min-h-[250px] md:min-h-0">
            <Image
              src={project.imageUrl}
              alt={`${project.title} screenshot`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              data-ai-hint="project showcase application"
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Multiple Featured Projects Carousel
  return (
     <motion.div
      className="my-12"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <Star className="text-amber-400 fill-amber-400" />
        <h2 className="text-2xl font-headline font-bold text-center">Featured Projects</h2>
      </div>
       <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {projects.map((project) => (
            <CarouselItem key={project.id} className="md:basis-1/1 lg:basis-1/1">
              <div className="p-1">
                 <div 
                    className={cn(
                        "relative rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden group",
                        "transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1"
                    )}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                     <div className="grid md:grid-cols-2 relative">
                        <div className="p-8 order-2 md:order-1 flex flex-col justify-center">
                            <h3 className="text-2xl md:text-3xl font-headline font-bold text-primary mb-3">{project.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {project.techStack.map((tech) => (
                                <Badge key={tech} variant="secondary">{tech}</Badge>
                                ))}
                            </div>
                            <p className="text-muted-foreground mb-6 line-clamp-3">{project.description}</p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                {project.liveDemoUrl && (
                                    <Button asChild>
                                    <Link href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink /> Live Demo
                                    </Link>
                                    </Button>
                                )}
                                <Button variant="secondary" asChild>
                                    <Link href={`/projects/${project.id}`}>
                                    <ArrowRight /> View Details
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="relative aspect-video md:aspect-square order-1 md:order-2">
                           <Image
                                src={project.imageUrl}
                                alt={`${project.title} screenshot`}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                data-ai-hint="project showcase application"
                            />
                        </div>
                    </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </motion.div>
  )
}


export default function HomePage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProjects() {
      setIsLoading(true);
      const { projects, error } = await getProjectsFromFirestore();
      if (error) {
        console.error("Error fetching projects from Firestore on homepage:", error.message);
        toast({
          title: "Error Fetching Projects",
          description: "Could not load projects from the database. Please try again later.",
          variant: "destructive",
        });
        setAllProjects([]);
      } else {
        setAllProjects(projects);
      }
      setIsLoading(false);
    }
    fetchProjects();
  }, [toast]);
  
  const featuredProjects = useMemo(() => {
    return allProjects.filter(p => p.isFeatured).sort((a, b) => a.title.localeCompare(b.title));
  }, [allProjects]);

  const techStacks = useMemo(() => {
    if (isLoading || allProjects.length === 0) return [];
    const stacks = allProjects.flatMap(p => p.techStack);
    return Array.from(new Set(stacks)).sort();
  }, [allProjects, isLoading]);

  useEffect(() => {
    let projectsToFilter = allProjects;
    if (activeFilter) {
      projectsToFilter = allProjects.filter(p => p.techStack.includes(activeFilter));
    }
    setFilteredProjects(projectsToFilter);
    setCurrentPage(1); // Reset to page 1 when filter changes
  }, [activeFilter, allProjects]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
    const endIndex = startIndex + PROJECTS_PER_PAGE;
    return filteredProjects.slice(startIndex, endIndex);
  }, [filteredProjects, currentPage]);
  
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
       const projectSection = document.getElementById('projects-section');
       if (projectSection) {
         projectSection.scrollIntoView({ behavior: 'smooth' });
       }
    }
  };


  const handleExploreProjects = () => {
    const projectSection = document.getElementById('projects-section');
    if (projectSection) {
      projectSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- Animation Variants for Typewriter Effect ---
  const headingText = "Code with Ali Imran";
  const headingWords = headingText.split(" ");

  const headingContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const wordVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const characterVariants = {
    hidden: {
      opacity: 0,
      y: '0.3em',
    },
    visible: {
      opacity: 1,
      y: '0em',
      transition: {
        duration: 0.8,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };
  // --- End of Animation Variants ---

  return (
    <>
      <section className="py-8">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            {/* Left Column - Text content */}
            <motion.div
              className="space-y-8 text-center md:text-left"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ staggerChildren: 0.2 }}
            >
              <motion.h1
                className="text-4xl font-headline font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-primary"
                variants={headingContainerVariants}
              >
                {headingWords.map((word, wordIndex) => (
                  <motion.span
                    key={wordIndex}
                    className="inline-block mr-[0.25em] whitespace-nowrap"
                    variants={wordVariants}
                  >
                    {word.split('').map((char, charIndex) => (
                      <motion.span
                        key={charIndex}
                        className="inline-block"
                        variants={characterVariants}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.p
                className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto md:mx-0"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 } },
                }}
              >
                Welcome to my digital portfolio. I'm a full-stack developer passionate about turning innovative ideas into seamless, high-performance web applications. Explore the projects I've built.
              </motion.p>
              
              {/* Tech Icons */}
              <motion.div
                className="flex justify-center md:justify-start items-center space-x-4"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
                }}
              >
                <span className="text-sm font-medium text-muted-foreground">Core Skills:</span>
                {techIcons.map((tech, index) => (
                  <motion.div
                    key={index}
                    variants={iconVariant}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-secondary rounded-full cursor-pointer"
                    title={tech.name}
                  >
                    <tech.icon className="h-6 w-6 text-secondary-foreground" />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.5 } },
                }}
              >
                <Button size="lg" onClick={handleExploreProjects} className="shadow-lg hover:shadow-xl transition-shadow group">
                  Explore Projects <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Column - Visual */}
            <motion.div
              className="relative hidden md:flex justify-center items-end h-[400px] md:h-[500px] lg:h-[600px]"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            >
              <motion.div
                className="absolute top-0 -right-[10%] w-[35rem] h-[35rem] bg-primary/20 rounded-full filter blur-3xl opacity-70 -z-10"
                animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
                transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>
              <motion.div
                className="absolute bottom-0 -left-[10%] w-[35rem] h-[35rem] bg-accent/20 rounded-full filter blur-3xl opacity-70 -z-10"
                animate={{ y: [0, -25, 0], x: [0, 15, 0] }}
                transition={{ duration: 45, repeat: Infinity, ease: "easeInOut", delay: 5 }}
              ></motion.div>
              
              <div
                className="relative w-full h-full pb-20"
              >
                <Image
                  src="https://res.cloudinary.com/dkfvndipz/image/upload/v1751431247/Code_with_Ali_Imran_1_qh4lf2.png"
                  alt="Full-body portrait of Ali Imran"
                  fill
                  className="object-contain object-bottom"
                  priority
                  sizes="(max-width: 768px) 70vw, 33vw"
                  data-ai-hint="person portrait"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="projects-section" className="pt-16">
        {isLoading ? (
          <div className="space-y-6">
            <div className="mb-8 flex flex-col items-center">
              <Skeleton className="h-8 w-48 bg-muted rounded-md mb-4" /> {/* Skeleton for "Filter by Technology" title */}
              <div className="w-full max-w-2xl whitespace-nowrap rounded-md border p-4">
                <div className="flex w-max space-x-2">
                  <Skeleton className="h-9 w-16 rounded-md" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-20 rounded-md" />
                  <Skeleton className="h-9 w-28 rounded-md" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          </div>
        ) : allProjects.length > 0 ? (
          <>
            <FeaturedProjectSection projects={featuredProjects} />
            
            <div className="border-t pt-16">
                 <ProjectFilter
                    techStacks={techStacks}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                />
                <ProjectGrid projects={paginatedProjects} />
                 {totalPages > 1 && (
                    <Pagination className="mt-12">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} aria-disabled={currentPage === 1} />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                           <PaginationItem key={i}>
                             <PaginationLink onClick={() => handlePageChange(i + 1)} isActive={currentPage === i + 1}>
                               {i + 1}
                             </PaginationLink>
                           </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext onClick={() => handlePageChange(currentPage + 1)} aria-disabled={currentPage === totalPages} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                )}
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            No projects found. Check back later or try adding some if you're an admin!
          </p>
        )}
      </section>
    </>
  );
}
