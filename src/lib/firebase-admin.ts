
import admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { Project } from './types';

// IMPORTANT: Path to your Firebase service account key file.
// Download from Firebase Console > Project Settings > Service accounts
// Store it securely and ensure it's in your .gitignore file.
const serviceAccountPath = './firebasekey.json';

interface AdminInstances {
  auth: Auth;
  db: Firestore;
}

let adminInstances: AdminInstances | null = null;

/**
 * Initializes and returns the Firebase Admin SDK instances.
 * This ensures the SDK is initialized only once.
 */
export function getAdminInstances(): AdminInstances {
  if (adminInstances) {
    return adminInstances;
  }

  // Check if the app is already initialized
  if (admin.apps.length === 0) {
    try {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error: any) {
      // Provide a more helpful error message if the key is missing.
      if (error.code === 'MODULE_NOT_FOUND') {
        console.error(`\n[Firebase Admin Error] Service account key not found at '${serviceAccountPath}'.`);
        console.error("Please download your service account key from the Firebase Console and place it in the root of your project as 'firebasekey.json'.\n");
      }
      throw error; // Re-throw the original error
    }
  }

  const firebaseApp = admin.app();
  adminInstances = { auth: firebaseApp.auth(), db: firebaseApp.firestore() };
  return adminInstances;
}

// --- Server-side data fetching functions for build time ---

export const getProjectsFromFirestore = async (): Promise<{
  projects: Project[];
  error: any;
}> => {
  try {
    const { db } = getAdminInstances();
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
    const { db } = getAdminInstances();
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
