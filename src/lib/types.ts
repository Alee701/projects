export interface Project {
  id: string;
  title: string;
  description: string; 
  techStack: string[];
  imageUrl: string;
  liveDemoUrl?: string;
  githubUrl?: string;
}
