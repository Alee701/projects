"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ProjectFilterProps {
  techStacks: string[];
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
}

export default function ProjectFilter({ techStacks, activeFilter, setActiveFilter }: ProjectFilterProps) {
  return (
    <div className="mb-8 flex flex-col items-center">
      <h2 className="text-xl font-headline mb-4">Filter by Technology</h2>
      <ScrollArea className="w-full max-w-2xl whitespace-nowrap rounded-md border">
        <div className="flex w-max space-x-2 p-4">
          <Button
            variant={activeFilter === null ? "default" : "outline"}
            onClick={() => setActiveFilter(null)}
            className="transition-all"
          >
            All
          </Button>
          {techStacks.map((tech) => (
            <Button
              key={tech}
              variant={activeFilter === tech ? "default" : "outline"}
              onClick={() => setActiveFilter(tech)}
              className="transition-all"
            >
              {tech}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
