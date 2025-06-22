
export interface Project {
  id: string;
  title: string;
  description: string; 
  techStack: string[];
  imageUrl: string;
  imagePublicId?: string; // For Cloudinary public ID
  liveDemoUrl?: string;
  githubUrl?: string;
}

export interface ContactSubmission {
  id?: string; // Firestore will auto-generate this
  name: string;
  email: string;
  message: string;
  submittedAt: string; // Stored as ISO string for serialization
}
