'use server';
/**
 * @fileOverview A Genkit flow to upload an image to Cloudinary.
 *
 * - uploadImageToCloudinary - A function that uploads an image data URI to Cloudinary.
 * - UploadImageToCloudinaryInput - The input type for the uploadImageToCloudinary function.
 * - UploadImageToCloudinaryOutput - The return type for the uploadImageToCloudinary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {v2 as cloudinary} from 'cloudinary';
          
// Ensure Cloudinary is configured.
// These environment variables need to be set in your Vercel project settings or .env.local file.
// CLOUDINARY_CLOUD_NAME
// CLOUDINARY_API_KEY
// CLOUDINARY_API_SECRET
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.warn("Cloudinary environment variables are not fully set. Uploads will likely fail.");
}

const UploadImageToCloudinaryInputSchema = z.object({
  imageDataUri: z.string().describe("The image file encoded as a Base64 data URI."),
  fileName: z.string().optional().describe("An optional file name for the image."),
});
export type UploadImageToCloudinaryInput = z.infer<typeof UploadImageToCloudinaryInputSchema>;

const UploadImageToCloudinaryOutputSchema = z.object({
  imageUrl: z.string().url().describe("The secure URL of the uploaded image on Cloudinary."),
  imagePublicId: z.string().describe("The public ID of the uploaded image on Cloudinary."),
});
export type UploadImageToCloudinaryOutput = z.infer<typeof UploadImageToCloudinaryOutputSchema>;


export async function uploadImageToCloudinary(input: UploadImageToCloudinaryInput): Promise<UploadImageToCloudinaryOutput> {
  return uploadImageFlow(input);
}

const uploadImageFlow = ai.defineFlow(
  {
    name: 'uploadImageToCloudinaryFlow',
    inputSchema: UploadImageToCloudinaryInputSchema,
    outputSchema: UploadImageToCloudinaryOutputSchema,
  },
  async (input) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary credentials are not configured in environment variables.");
    }
    try {
      const result = await cloudinary.uploader.upload(input.imageDataUri, {
        folder: "project_showcase_images", // Optional: organize uploads into a folder
        public_id: input.fileName ? input.fileName.split('.')[0] : undefined, // Use filename as public_id if provided
        overwrite: true,
        resource_type: "image",
      });
      
      if (!result.secure_url || !result.public_id) {
        throw new Error("Cloudinary upload failed to return a secure URL or public ID.");
      }

      return {
        imageUrl: result.secure_url,
        imagePublicId: result.public_id,
      };
    } catch (error: any) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }
);
