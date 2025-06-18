"use client";

import { useState, useEffect, useMemo } from 'react';
import ProjectGrid from '@/components/projects/ProjectGrid';
import ProjectFilter from '@/components/projects/ProjectFilter';
import { mockProjects, getAllTechStacks } from '@/data/projects';
import type { Project } from '@/lib/types';

export default function HomePage() {
  const [allProjects] = useState<Project[]>(mockProjects); // Static mock data
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

  return (
    <>
      <section className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold mb-4 text-primary tracking-tight">
          Student Project Showcase
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover innovative web development projects by talented students. Explore their skills and creativity.
        </p>
      </section>
      <ProjectFilter
        techStacks={techStacks}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />
      <ProjectGrid projects={filteredProjects} />
    </>
  );
}
