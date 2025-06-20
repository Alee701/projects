
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  type Auth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink as firebaseSignInWithEmailLink, // renamed to avoid conflict
  type ActionCodeSettings
} from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, getDoc, updateDoc, type Firestore, query, orderBy } from "firebase/firestore";
import type { Project } from "./types";

const LOGIN_PATH = '/super-secret-login-page';

const firebaseConfig = {
  apiKey: "AIzaSyBZdfwKt32XAY5Dm3vaoLXbfHjecx08ESs",
  authDomain: "project-management-afd7a.firebaseapp.com",
  projectId: "project-management-afd7a",
  storageBucket: "project-management-afd7a.appspot.com",
  messagingSenderId: "872074080118",
  appId: "1:872074080118:web:1eaf61744ebb7dd73b1457",
  measurementId: "G-FDTY2KY3T2"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
auth = getAuth(app);
db = getFirestore(app);

export const defaultActionCodeSettings: ActionCodeSettings = {
  // The URL must be whitelisted in the Firebase Console > Authentication > Settings > Authorized domains.
  // Ensure NEXT_PUBLIC_APP_URL is set correctly in your environment variables.
  url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}${LOGIN_PATH}`, 
  handleCodeInApp: true,
};

export const requestLoginLinkForEmail = async (email: string, actionCodeSettings: ActionCodeSettings) => {
  return sendSignInLinkToEmail(auth, email, actionCodeSettings);
};

export const verifyIsLoginLink = (link: string): boolean => {
  return isSignInWithEmailLink(auth, link);
};

export const signInUserWithLink = async (email: string, link: string) => {
  try {
    const userCredential = await firebaseSignInWithEmailLink(auth, email, link);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: { message: error.message, code: error.code } };
  }
};

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

export const addProjectToFirestore = async (projectData: Omit<Project, 'id'>) => {
  try {
    const dataToSave = {
      ...projectData,
      imagePublicId: projectData.imagePublicId || null, // Ensure null if undefined
    };
    const docRef = await addDoc(collection(db, "projects"), dataToSave);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: { message: error.message } };
  }
};

export const updateProjectInFirestore = async (projectId: string, projectData: Partial<Omit<Project, 'id'>>) => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const dataToUpdate: {[key: string]: any} = { // More flexible type for updates
      ...projectData,
    };
    if (projectData.hasOwnProperty('imagePublicId')) { // Explicitly check if property exists
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

export const deleteProjectFromFirestore = async (projectId: string) => {
  try {
    await deleteDoc(doc(db, "projects", projectId));
    // Note: Image deletion from Cloudinary would need a separate process or flow call here
    // For now, it only deletes the Firestore document.
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
};

export { app, auth, db };
