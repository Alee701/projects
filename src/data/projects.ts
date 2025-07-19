
import type { Project } from '@/lib/types';
// We now use the admin functions for build-time fetching, so this file can be simplified.
// Client-side fetches still use the normal firebase functions.
import { getProjectsFromFirestore } from '@/lib/firebase';

// This function can remain for client-side fetches if needed, but for build time,
// the admin version is used directly in the page.
export async function getAllProjects(): Promise<{ projects: Project[], error: any }> {
  return getProjectsFromFirestore();
}
