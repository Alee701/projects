
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, type Auth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, getDoc, updateDoc, type Firestore, query, orderBy } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject, type Storage } from "firebase/storage";
import type { Project } from "./types";

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
let storage: Storage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

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

export const uploadProjectImage = async (file: File, fileName: string): Promise<{ url: string | null, error: any }> => {
  const filePath = `project_images/${fileName}`;
  const imageFileRef = storageRef(storage, filePath);
  try {
    const snapshot = await uploadBytesResumable(imageFileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { url: downloadURL, error: null };
  } catch (error: any) {
    console.error("Error uploading image to Firebase Storage:", error);
    return { url: null, error: { message: error.message } };
  }
};

export const deleteProjectImageByUrl = async (imageUrl: string): Promise<{ error: any }> => {
  if (!imageUrl || imageUrl.startsWith('https://placehold.co')) {
    // Do not attempt to delete placeholder images
    return { error: null };
  }
  try {
    const imageRef = storageRef(storage, imageUrl); // Firebase SDK can parse the full URL
    await deleteObject(imageRef);
    return { error: null };
  } catch (error: any) {
    if ((error as any).code === 'storage/object-not-found') {
      console.warn("Tried to delete image that was not found in storage:", imageUrl);
      return { error: null }; 
    }
    console.error("Error deleting image from Firebase Storage:", error);
    return { error: { message: (error as Error).message } };
  }
};


export const addProjectToFirestore = async (projectData: Omit<Project, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, "projects"), projectData);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: { message: error.message } };
  }
};

export const updateProjectInFirestore = async (projectId: string, projectData: Partial<Omit<Project, 'id'>>) => {
  try {
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, projectData);
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
    // First, get the project to find its image URL if it exists
    const { project, error: fetchError } = await getProjectByIdFromFirestore(projectId);
    if (fetchError && !project) { // if fetchError is not null AND project is null or undefined
        console.error("Error fetching project before deletion, cannot delete image:", fetchError.message);
        // Proceed to delete Firestore document anyway, or handle as critical error
    }

    if (project && project.imageUrl && !project.imageUrl.startsWith('https://placehold.co')) {
        const { error: deleteImageError } = await deleteProjectImageByUrl(project.imageUrl);
        if (deleteImageError) {
            // Log image deletion error but proceed to delete Firestore document
            console.warn(`Failed to delete image ${project.imageUrl} from storage: ${deleteImageError.message}`);
        }
    }
    await deleteDoc(doc(db, "projects", projectId));
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
};

export { app, auth, db, storage };
