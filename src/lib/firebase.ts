
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, type Auth } from "firebase/auth"; // Added signInWithEmailAndPassword and signOut
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, type Firestore } from "firebase/firestore"; // Added Firestore functions

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTKOIysopkM7Z8kQhZZuctutaEEeJSSaM",
  authDomain: "assignment-bcafa.firebaseapp.com",
  projectId: "assignment-bcafa",
  storageBucket: "assignment-bcafa.appspot.com",
  messagingSenderId: "245476925719",
  appId: "1:245476925719:web:814d7573b1755245be5752",
  measurementId: "G-MPQSPS47YJ"
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


// Actual Firebase functions
export const signInWithEmail = async (email?: string, password?: string) => {
  console.log("Attempting Firebase sign in with:", email);
  if (!email || !password) {
    console.warn("Email or password not provided for Firebase sign in.");
    return { user: null, error: { message: "Email and password are required." } };
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Firebase Sign In Successful for:", email);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    console.error("Firebase Sign In Error:", error.message);
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

export const addProjectToFirestore = async (projectData: any) => {
  console.log("Attempting to add project to Firestore:", projectData);
  try {
    const docRef = await addDoc(collection(db, "projects"), projectData);
    console.log("Project added to Firestore with ID:", docRef.id);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    console.error("Error adding project to Firestore:", error.message);
    return { id: null, error: { message: error.message } };
  }
};

export const getProjectsFromFirestore = async () => {
  console.log("Attempting to get projects from Firestore");
  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log("Successfully fetched projects from Firestore:", projects.length);
    return { projects, error: null };
  } catch (error: any) {
    console.error("Error fetching projects from Firestore:", error.message);
    return { projects: [], error: { message: error.message } };
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
