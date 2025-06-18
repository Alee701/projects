
import type { Project } from '@/lib/types';
import { getProjectByIdFromFirestore, getProjectsFromFirestore } from '@/lib/firebase'; // Import Firestore functions

// mockProjects is no longer used as primary data source.
// It can be kept for testing or completely removed. For this update, we'll remove it.
// export const mockProjects: Project[] = [ ... ];

export async function getProjectById(id: string): Promise<Project | undefined> {
  const { project, error } = await getProjectByIdFromFirestore(id);
  if (error) {
    console.error("Error fetching project by ID for details page:", error);
    return undefined;
  }
  return project ?? undefined;
}

// This function is no longer ideal here as tech stacks will be derived from live data.
// It can be removed or adapted if a global list of all possible tech stacks is needed elsewhere.
// For now, ProjectFilter on the homepage will derive stacks from the fetched projects.
// export function getAllTechStacks(): string[] {
//   const allStacks = mockProjects.flatMap(project => project.techStack);
//   return Array.from(new Set(allStacks)).sort();
// }

// Helper function for generateStaticParams, fetches only IDs or minimal data.
export async function getAllProjectIds(): Promise<{ id: string }[]> {
  const { projects, error } = await getProjectsFromFirestore(); // This fetches full project data
  if (error) {
    console.error("Error fetching project IDs for static generation:", error);
    return [];
  }
  // In a real scenario with many projects, you might create a separate Firestore function
  // to only fetch document IDs for efficiency.
  return projects.map(project => ({ id: project.id }));
}
