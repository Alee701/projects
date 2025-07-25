
export interface Project {
  id: string;
  title: string;
  description: string; 
  techStack: string[];
  imageUrl: string;
  imagePublicId?: string; // For Cloudinary public ID
  liveDemoUrl?: string;
  githubUrl?: string;
  authorName?: string;
  authorImageUrl?: string;
  isFeatured?: boolean;
}

export interface ContactSubmission {
  id?: string; // Firestore will auto-generate this
  name: string;
  email: string;
  message: string;
  submittedAt: string; // Stored as ISO string for serialization
  category?: 'Job Inquiry' | 'Collaboration' | 'Feedback' | 'Spam' | 'General';
  isRead?: boolean;
}
