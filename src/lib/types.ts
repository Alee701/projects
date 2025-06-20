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
