
'use server';
/**
 * @fileOverview A Genkit flow to categorize contact form submissions.
 *
 * - categorizeSubmission - A function that analyzes a message and assigns a category.
 * - CategorizeSubmissionInput - The input type for the categorizeSubmission function.
 * - CategorizeSubmissionOutput - The return type for the categorizeSubmission function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const Categories = z.enum(['Job Inquiry', 'Collaboration', 'Feedback', 'Spam', 'General']);

const CategorizeSubmissionInputSchema = z.object({
  message: z.string().describe('The content of the contact form message.'),
});
export type CategorizeSubmissionInput = z.infer<typeof CategorizeSubmissionInputSchema>;

const CategorizeSubmissionOutputSchema = z.object({
  category: Categories.describe('The most appropriate category for the message.'),
});
export type CategorizeSubmissionOutput = z.infer<typeof CategorizeSubmissionOutputSchema>;

export async function categorizeSubmission(input: CategorizeSubmissionInput): Promise<CategorizeSubmissionOutput> {
  return categorizeSubmissionFlow(input);
}

const categorizationPrompt = ai.definePrompt({
  name: 'categorizeSubmissionPrompt',
  input: {schema: CategorizeSubmissionInputSchema},
  output: {schema: CategorizeSubmissionOutputSchema},
  prompt: `You are a helpful administrative assistant. Your task is to categorize an incoming message from a website contact form.
Based on the message content, classify it into one of the following categories: "Job Inquiry", "Collaboration", "Feedback", "Spam", or "General".

- "Job Inquiry": For messages about employment, freelance work, or recruitment.
- "Collaboration": For proposals to partner on projects or other ventures.
- "Feedback": For comments about the website or projects.
- "Spam": For unsolicited or irrelevant marketing messages.
- "General": For everything else that doesn't fit the other categories.

Message:
"{{{message}}}"

You MUST respond with a valid JSON object containing only the "category" key.
`,
});

const categorizeSubmissionFlow = ai.defineFlow(
  {
    name: 'categorizeSubmissionFlow',
    inputSchema: CategorizeSubmissionInputSchema,
    outputSchema: CategorizeSubmissionOutputSchema,
  },
  async (input) => {
    const {output} = await categorizationPrompt(input);
    if (!output) {
      // Fallback to "General" if AI fails
      return { category: 'General' };
    }
    return output;
  }
);
