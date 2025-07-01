
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { categorizeSubmission } from '@/ai/flows/categorize-submission-flow';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export async function submitContactForm(data: z.infer<typeof contactFormSchema>) {
  try {
    // Re-validate data on the server as a security measure
    const validatedData = contactFormSchema.parse(data);

    const submission = {
      ...validatedData,
      submittedAt: FieldValue.serverTimestamp(),
      category: 'General', // Default category, will be updated by AI
      isRead: false,
    };
    
    const docRef = await db.collection('contactSubmissions').add(submission);

    // Asynchronously categorize the submission without blocking the user's response
    categorizeSubmission({ message: validatedData.message })
      .then(result => {
        db.collection('contactSubmissions').doc(docRef.id).update({ category: result.category });
      })
      .catch(error => {
        // Log the error but don't fail the user's submission
        console.error(`Failed to categorize submission ${docRef.id}:`, error);
      });

    return { success: true, message: 'Message sent! I will get back to you as soon as possible.' };
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    // Handle potential Zod validation errors
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Invalid data provided. Please check the form and try again.' };
    }
    // Return a generic error for other issues
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}
