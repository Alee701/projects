"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import ProjectGrid from '@/components/projects/ProjectGrid';
import ProjectFilter from '@/components/projects/ProjectFilter';
import { mockProjects, getAllTechStacks } from '@/data/projects';
import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [allProjects] = useState<Project[]>(mockProjects);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(allProjects);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const techStacks = useMemo(() => getAllTechStacks(), []);

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
                Discover innovative full-stack web applications built by talented students. Explore their skills in MongoDB, Express.js, React, and Node.js.
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
        <ProjectFilter
          techStacks={techStacks}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
        <ProjectGrid projects={filteredProjects} />
      </section>
    </>
  );
}
