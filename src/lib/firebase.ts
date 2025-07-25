
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  type Auth,
} from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, setDoc, type Firestore, query, orderBy } from "firebase/firestore";
import type { Project } from "./types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "project-management-afd7a.firebaseapp.com",
  projectId: "project-management-afd7a",
  storageBucket: "project-management-afd7a.appspot.com",
  messagingSenderId: "872074080118",
  appId: "1:872074080118:web:1eaf61744ebb7dd73b1457",
  measurementId: "G-FDTY2KY3T2"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
auth = getAuth(app);
db = getFirestore(app);


export const signInWithEmail = async (email?: string, password?: string) => {
  if (!email || !password) {
    const err = { message: "Email and password are required." };
    return { user: null, error: err };
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: { message: error.message } };
  }
};

export const signOutFirebase = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
};

const generateProjectId = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with a single one
    .trim();
};


export const addProjectToFirestore = async (projectData: Omit<Project, 'id'>) => {
  try {
    const projectId = generateProjectId(projectData.title);
    const projectRef = doc(db, "projects", projectId);
    
    const dataToSave = {
      ...projectData,
      imagePublicId: projectData.imagePublicId || null,
      liveDemoUrl: projectData.liveDemoUrl || '',
      githubUrl: projectData.githubUrl || '',
      authorName: projectData.authorName || 'Ali Imran',
      authorImageUrl: projectData.authorImageUrl || 'https://res.cloudinary.com/dkfvndipz/image/upload/v1751431247/Code_with_Ali_Imran_1_qh4lf2.png',
      isFeatured: projectData.isFeatured || false,
    };
    
    // Use setDoc to create a document with a specific ID
    await setDoc(projectRef, dataToSave);
    
    return { id: projectId, error: null };
  } catch (error: any) {
    return { id: null, error: { message: error.message } };
  }
};


export const updateProjectInFirestore = async (projectId: string, projectData: Partial<Omit<Project, 'id'>>) => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const dataToUpdate: {[key: string]: any} = {
      ...projectData,
    };
    if (projectData.hasOwnProperty('imagePublicId')) {
      dataToUpdate.imagePublicId = projectData.imagePublicId || null;
    }
    await updateDoc(projectRef, dataToUpdate);
    return { id: projectId, error: null };
  } catch (error: any) {
    return { id: null, error: { message: error.message } };
  }
};

export const getProjectsFromFirestore = async (): Promise<{ projects: Project[], error: any }> => {
  try {
    const projectsQuery = query(collection(db, "projects"), orderBy("title"));
    const querySnapshot = await getDocs(projectsQuery);
    const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    return { projects, error: null };
  } catch (error: any) {
    return { projects: [], error: { message: error.message } };
  }
};

export const getProjectByIdFromFirestore = async (projectId: string): Promise<{ project: Project | null, error: any }> => {
  try {
    const docRef = doc(db, "projects", projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const project = { id: docSnap.id, ...docSnap.data() } as Project;
      return { project, error: null };
    } else {
      return { project: null, error: { message: "Project not found."} };
    }
  } catch (error: any) {
    return { project: null, error: { message: error.message } };
  }
};

export { app, auth, db };
