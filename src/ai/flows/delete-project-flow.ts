'use server';
/**
 * @fileOverview A Genkit flow to delete a project and its associated image from Cloudinary.
 *
 * - deleteProject - A function that handles the project deletion process.
 * - DeleteProjectInput - The input type for the deleteProject function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {v2 as cloudinary} from 'cloudinary';
import { getAdminInstances } from '@/lib/firebase-admin';

// Ensure Cloudinary is configured.
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.warn("Cloudinary environment variables are not fully set for deletion flow.");
}

const DeleteProjectInputSchema = z.object({
  projectId: z.string().describe("The ID of the project to delete."),
});
export type DeleteProjectInput = z.infer<typeof DeleteProjectInputSchema>;

// The output can be a simple success message
const DeleteProjectOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteProjectOutput = z.infer<typeof DeleteProjectOutputSchema>;

export async function deleteProject(input: DeleteProjectInput): Promise<DeleteProjectOutput> {
  return deleteProjectFlow(input);
}

const deleteProjectFlow = ai.defineFlow(
  {
    name: 'deleteProjectFlow',
    inputSchema: DeleteProjectInputSchema,
    outputSchema: DeleteProjectOutputSchema,
  },
  async ({ projectId }) => {
    const { db } = getAdminInstances();
    const projectRef = db.collection('projects').doc(projectId);

    try {
      const docSnap = await projectRef.get();
      if (!docSnap.exists) {
        throw new Error("Project not found.");
      }
      
      const projectData = docSnap.data();
      const imagePublicId = projectData?.imagePublicId;

      // Step 1: Delete image from Cloudinary if public ID exists
      if (imagePublicId && process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          await cloudinary.uploader.destroy(imagePublicId);
        } catch (cloudinaryError: any) {
          // Log the error but don't block Firestore deletion
          console.error(`Failed to delete image from Cloudinary (public_id: ${imagePublicId}):`, cloudinaryError.message);
        }
      }

      // Step 2: Delete project document from Firestore
      await projectRef.delete();

      return { success: true, message: "Project and associated image deleted successfully." };
    } catch (error: any) {
      console.error(`Error deleting project ${projectId}:`, error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }
);
