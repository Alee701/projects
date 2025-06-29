
'use server';
/**
 * @fileOverview A Genkit flow to suggest project descriptions.
 *
 * - suggestProjectDescription - A function that generates a project description based on title and tech stack.
 * - SuggestProjectDescriptionInput - The input type for the suggestProjectDescription function.
 * - SuggestProjectDescriptionOutput - The return type for the suggestProjectDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProjectDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the project.'),
  techStack: z.string().describe('A comma-separated string of technologies used in the project.'),
});
export type SuggestProjectDescriptionInput = z.infer<typeof SuggestProjectDescriptionInputSchema>;

const SuggestProjectDescriptionOutputSchema = z.object({
  suggestedDescription: z.string().describe('The AI-generated project description.'),
});
export type SuggestProjectDescriptionOutput = z.infer<typeof SuggestProjectDescriptionOutputSchema>;

export async function suggestProjectDescription(input: SuggestProjectDescriptionInput): Promise<SuggestProjectDescriptionOutput> {
  return suggestProjectDescriptionFlow(input);
}

const descriptionPrompt = ai.definePrompt({
  name: 'suggestProjectDescriptionPrompt',
  input: {schema: SuggestProjectDescriptionInputSchema},
  output: {schema: SuggestProjectDescriptionOutputSchema},
  prompt: `You are an expert technical writer. Your task is to generate a concise and engaging project description based on the provided title and technology stack.
The description should highlight the project's purpose and key technologies. Aim for 2-4 sentences.

Project Title: {{{title}}}
Technology Stack: {{{techStack}}}

You MUST respond with a valid JSON object. Do not include any text, markdown, or formatting before or after the JSON object.
The JSON object must have a single key "suggestedDescription" with the generated description as its string value.
Example response:
{
  "suggestedDescription": "A full-stack web application built with React and Node.js that allows users to track their expenses."
}`,
});

const suggestProjectDescriptionFlow = ai.defineFlow(
  {
    name: 'suggestProjectDescriptionFlow',
    inputSchema: SuggestProjectDescriptionInputSchema,
    outputSchema: SuggestProjectDescriptionOutputSchema,
  },
  async (input) => {
    const {output} = await descriptionPrompt(input);
    if (!output) {
      throw new Error('Failed to get a valid response from the AI model.');
    }
    return output;
  }
);
    