
import {getFirebaseAdminApp} from '@genkit-ai/next/firebase';
import type {Auth} from 'firebase-admin/auth';
import type {Firestore} from 'firebase-admin/firestore';
import type {Project} from './types';

interface AdminInstances {
  auth: Auth;
  db: Firestore;
}

let adminInstances: AdminInstances | null = null;

/**
 * Lazily initializes and returns the Firebase Admin SDK instances
 * using the Genkit-provided Firebase Admin App. This ensures that
 * the SDK is initialized correctly with the necessary credentials,

 * both in development and during the production build.
 */
export function getAdminInstances(): AdminInstances {
  if (adminInstances) {
    return adminInstances;
  }

  const app = getFirebaseAdminApp();
  adminInstances = {auth: app.auth(), db: app.firestore()};
  return adminInstances;
}

// --- Server-side data fetching functions for build time ---

export const getProjectsFromFirestore = async (): Promise<{
  projects: Project[];
  error: any;
}> => {
  try {
    const {db} = getAdminInstances();
    const projectsQuery = db.collection('projects').orderBy('title');
    const querySnapshot = await projectsQuery.get();
    const projects = querySnapshot.docs.map(
      doc => ({id: doc.id, ...doc.data()} as Project)
    );
    return {projects, error: null};
  } catch (error: any) {
    console.error('Admin SDK - Error fetching projects:', error);
    return {projects: [], error: {message: error.message}};
  }
};

export const getProjectByIdFromFirestore = async (
  projectId: string
): Promise<{project: Project | null; error: any}> => {
  try {
    const {db} = getAdminInstances();
    const docRef = db.collection('projects').doc(projectId);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const project = {id: docSnap.id, ...docSnap.data()} as Project;
      return {project, error: null};
    } else {
      return {project: null, error: {message: 'Project not found.'}};
    }
  } catch (error: any) {
    console.error(`Admin SDK - Error fetching project ${projectId}:`, error);
    return {project: null, error: {message: error.message}};
  }
};
