
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, type Auth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, getDoc, type Firestore, query, orderBy } from "firebase/firestore";
import type { Project } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyBZdfwKt32XAY5Dm3vaoLXbfHjecx08ESs", // Original key
  authDomain: "project-management-afd7a.firebaseapp.com", // Original domain
  projectId: "project-management-afd7a", // Original projectId
  storageBucket: "project-management-afd7a.firebasestorage.app", // Original storageBucket
  messagingSenderId: "872074080118", // Original senderId
  appId: "1:872074080118:web:1eaf61744ebb7dd73b1457", // Original appId
  measurementId: "G-FDTY2KY3T2" // Original measurementId
};


// Initialize Firebase
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

// Authentication functions
export const signInWithEmail = async (email?: string, password?: string) => {
  console.log("Attempting Firebase sign in with:", email);
  if (!email || !password) {
    console.warn("Email or password not provided for Firebase sign in.");
    const err = { message: "Email and password are required." };
    alert(err.message);
    return { user: null, error: err };
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Firebase Sign In Successful for:", email);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    console.error("Firebase Sign In Error:", error.message);
    alert(`Login failed: ${error.message || "Please try again."}`);
    return { user: null, error: { message: error.message } };
  }
};

export const signOutFirebase = async () => {
  console.log("Attempting Firebase sign out");
  try {
    await signOut(auth);
    console.log("Firebase Sign Out Successful");
    return { error: null };
  } catch (error: any) {
    console.error("Firebase Sign Out Error:", error.message);
    return { error: { message: error.message } };
  }
};

// Firestore functions for Projects
export const addProjectToFirestore = async (projectData: Omit<Project, 'id'>) => {
  console.log("Attempting to add project to Firestore:", projectData);
  try {
    // Add a server-side timestamp if you want to sort by creation date
    // const dataWithTimestamp = { ...projectData, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, "projects"), projectData);
    console.log("Project added to Firestore with ID:", docRef.id);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    console.error("Error adding project to Firestore:", error.message);
    return { id: null, error: { message: error.message } };
  }
};

export const getProjectsFromFirestore = async (): Promise<{ projects: Project[], error: any }> => {
  console.log("Attempting to get projects from Firestore");
  try {
    // Example: Order by title. You might want to order by a 'createdAt' timestamp
    const projectsQuery = query(collection(db, "projects"), orderBy("title")); 
    const querySnapshot = await getDocs(projectsQuery);
    const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    console.log("Successfully fetched projects from Firestore:", projects.length);
    return { projects, error: null };
  } catch (error: any) {
    console.error("Error fetching projects from Firestore:", error.message);
    return { projects: [], error: { message: error.message } };
  }
};

export const getProjectByIdFromFirestore = async (projectId: string): Promise<{ project: Project | null, error: any }> => {
  console.log("Attempting to get project by ID from Firestore:", projectId);
  try {
    const docRef = doc(db, "projects", projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const project = { id: docSnap.id, ...docSnap.data() } as Project;
      console.log("Successfully fetched project:", project);
      return { project, error: null };
    } else {
      console.log("No such project document!");
      return { project: null, error: { message: "Project not found."} };
    }
  } catch (error: any) {
    console.error("Error fetching project by ID from Firestore:", error.message);
    return { project: null, error: { message: error.message } };
  }
};

export const deleteProjectFromFirestore = async (projectId: string) => {
  console.log("Attempting to delete project from Firestore:", projectId);
  try {
    await deleteDoc(doc(db, "projects", projectId));
    console.log("Project deleted from Firestore:", projectId);
    return { error: null };
  } catch (error: any) {
    console.error("Error deleting project from Firestore:", error.message);
    return { error: { message: error.message } };
  }
};

export { app, auth, db };
