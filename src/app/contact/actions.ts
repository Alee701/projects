
'use server';

import { z } from 'zod';
import { addContactSubmissionToFirestore } from '@/lib/firebase';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

export async function submitContactForm(data: z.infer<typeof contactFormSchema>) {
  try {
    const result = await addContactSubmissionToFirestore(data);

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to save submission to the database.');
    }

    return { success: true, message: 'Message sent! I will get back to you as soon as possible.' };
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}
