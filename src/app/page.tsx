
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
                    className="p-2 bg-secondary rounded-full"
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
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut", delay: 0.2 } }
              }}
            >
              <motion.div
                className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full filter blur-xl opacity-70"
                animate={{ y: [0, 20, 0], x: [0, -10, 0], rotate: [0, 15, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>
              <motion.div
                className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/10 rounded-full filter blur-xl opacity-70"
                animate={{ y: [0, -20, 0], x: [0, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              ></motion.div>
              
              <motion.div
                className="relative"
                animate={{ y: ["0rem", "-0.75rem", "0rem"] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <div className="relative bg-card p-2 rounded-xl shadow-2xl border border-border/10 transform transition-all duration-500 hover:scale-[1.02] hover:-rotate-1">
                  <div className="bg-muted/30 p-2 px-4 rounded-t-lg flex items-center space-x-2">
                    <span className="h-3 w-3 bg-red-500 rounded-full block"></span>
                    <span className="h-3 w-3 bg-yellow-500 rounded-full block"></span>
                    <span className="h-3 w-3 bg-green-500 rounded-full block"></span>
                  </div>
                  <div className="relative aspect-video rounded-b-lg overflow-hidden bg-background">
                    <Image
                      src="https://res.cloudinary.com/dkfvndipz/image/upload/v1750632942/Code_with_Ali_Imran_uld2i6.png"
                      alt="Code with Ali Imran branding"
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      data-ai-hint="code brand logo"
                    />
                  </div>
                </div>
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
