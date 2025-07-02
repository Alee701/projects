
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import ProjectGrid from '@/components/projects/ProjectGrid';
import ProjectFilter from '@/components/projects/ProjectFilter';
import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Database, Server, Component, Code2 } from 'lucide-react';
import { getProjectsFromFirestore } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import ProjectCardSkeleton from '@/components/projects/ProjectCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

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

export default function HomePage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        setFilteredProjects(projects);
      }
      setIsLoading(false);
    }
    fetchProjects();
  }, [toast]);

  const techStacks = useMemo(() => {
    if (isLoading || allProjects.length === 0) return [];
    const stacks = allProjects.flatMap(p => p.techStack);
    return Array.from(new Set(stacks)).sort();
  }, [allProjects, isLoading]);

  useEffect(() => {
    if (!activeFilter) {
      setFilteredProjects(allProjects);
    } else {
      setFilteredProjects(
        allProjects.filter(p => p.techStack.includes(activeFilter))
      );
    }
  }, [activeFilter, allProjects]);

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
      <section className="py-20 md:py-28 lg:py-32 overflow-hidden">
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
                viewport={{ once: false, amount: 0.3 }}
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
              className="relative flex justify-center items-end h-[400px] md:h-[500px] lg:h-[600px]"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            >
              <motion.div
                className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full filter blur-2xl opacity-60"
                animate={{ y: [0, 30, 0], x: [0, -20, 0], rotate: [0, 25, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>
              <motion.div
                className="absolute bottom-10 left-10 w-56 h-56 bg-accent/10 rounded-full filter blur-2xl opacity-60"
                animate={{ y: [0, -30, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              ></motion.div>
              
              <motion.div
                className="relative w-full h-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="https://placehold.co/400x600.png"
                  alt="Full-body portrait of Ali Imran"
                  fill
                  className="object-contain object-bottom"
                  priority
                  sizes="(max-width: 768px) 70vw, 33vw"
                  data-ai-hint="full body portrait developer"
                />
              </motion.div>
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
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          </div>
        ) : allProjects.length > 0 ? (
          <>
            <ProjectFilter
              techStacks={techStacks}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
            <ProjectGrid projects={filteredProjects} />
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
