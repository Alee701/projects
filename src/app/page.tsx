
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import ProjectGrid from '@/components/projects/ProjectGrid';
import ProjectFilter from '@/components/projects/ProjectFilter';
import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { getProjectsFromFirestore } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

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
        toast({
          title: "Error Fetching Projects",
          description: "Could not load projects from the database. Please try again later.",
          variant: "destructive",
        });
        setAllProjects([]); // Set to empty array on error
      } else {
        setAllProjects(projects);
        setFilteredProjects(projects); // Initialize filtered projects
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

  return (
    <>
      <section className="py-12 md:py-20 lg:py-28 bg-gradient-to-br from-background to-secondary/30 dark:from-background dark:to-secondary/10 rounded-xl shadow-lg mb-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-headline font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-primary">
                Showcasing MERN Stack Excellence
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl max-w-2xl">
                Discover innovative full-stack web applications built by talented developers. Explore their skills in MongoDB, Express.js, React, and Node.js.
              </p>
              <Button size="lg" onClick={handleExploreProjects} className="shadow-md hover:shadow-lg transition-shadow">
                Explore Projects <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-105">
              <Image
                src="https://placehold.co/800x450.png"
                alt="MERN Stack Development Showcase"
                fill
                className="object-cover"
                priority
                data-ai-hint="web development code"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="projects-section">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading Projects...</p>
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
