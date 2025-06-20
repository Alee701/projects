
'use server';

import { z } from 'zod';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

export async function submitContactForm(data: z.infer<typeof contactFormSchema>) {
  try {
    // Here you would typically send an email, save to a database, etc.
    // For this demonstration, we'll just log it to the server console and simulate a delay.
    console.log('New contact form submission:', data);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // You can add more complex logic here, like checking if the email sending failed.
    // For now, we'll assume it's always successful if it doesn't throw an error.

    return { success: true, message: 'Your message has been sent successfully!' };
  } catch (error) {
    console.error('Contact form submission error:', error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}
