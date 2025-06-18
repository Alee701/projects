import type { Project } from '@/lib/types';

export const mockProjects: Project[] = [
  {
    id: 'project-1',
    title: 'Ecoleta - Recycling Points Finder',
    description: 'A web and mobile application to connect people with collection points for recyclable materials. Built during Next Level Week by Rocketseat.',
    techStack: ['React', 'Node.js', 'TypeScript', 'SQLite'],
    imageUrl: 'https://placehold.co/600x400.png',
    liveDemoUrl: '#',
    githubUrl: '#',
  },
  {
    id: 'project-2',
    title: 'DevFinance - Personal Finance Tracker',
    description: 'A simple application to track personal income and expenses. Helps users manage their finances effectively. Developed as part of a web development bootcamp.',
    techStack: ['HTML', 'CSS', 'JavaScript'],
    imageUrl: 'https://placehold.co/600x400.png',
    liveDemoUrl: '#',
    githubUrl: '#',
  },
  {
    id: 'project-3',
    title: 'Portfolio Website V1',
    description: 'My first personal portfolio website showcasing initial projects and skills. Focused on clean design and responsiveness.',
    techStack: ['React', 'Next.js', 'Tailwind CSS'],
    imageUrl: 'https://placehold.co/600x400.png',
    liveDemoUrl: '#',
    githubUrl: '#',
  },
  {
    id: 'project-4',
    title: 'Task Management App',
    description: 'A full-stack task management application with user authentication and real-time updates. Allows users to create, organize, and track tasks.',
    techStack: ['Vue.js', 'Firebase', 'Vuetify'],
    imageUrl: 'https://placehold.co/600x400.png',
    liveDemoUrl: '#',
    githubUrl: '#',
  },
  {
    id: 'project-5',
    title: 'E-commerce Platform Frontend',
    description: 'The frontend for a mock e-commerce website, featuring product listings, cart functionality, and user profiles. Built with a focus on UI/UX.',
    techStack: ['Angular', 'TypeScript', 'SCSS'],
    imageUrl: 'https://placehold.co/600x400.png',
    githubUrl: '#',
  },
  {
    id: 'project-6',
    title: 'Blog API with GraphQL',
    description: 'A backend API for a blogging platform, implemented using GraphQL. Supports operations for posts, comments, and users.',
    techStack: ['Node.js', 'Express', 'GraphQL', 'MongoDB'],
    imageUrl: 'https://placehold.co/600x400.png',
    liveDemoUrl: '#',
  },
];

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find(project => project.id === id);
}

export function getAllTechStacks(): string[] {
  const allStacks = mockProjects.flatMap(project => project.techStack);
  return Array.from(new Set(allStacks)).sort();
}
