'use server';

/**
 * @fileOverview Generates an initial set of requirements from a prompt describing an application idea.
 *
 * - generateRequirementsFromPrompt - A function that generates requirements from a prompt.
 * - GenerateRequirementsFromPromptInput - The input type for the generateRequirementsFromPrompt function.
 * - GenerateRequirementsFromPromptOutput - The return type for the generateRequirementsFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRequirementsFromPromptInputSchema = z.object({
  prompt: z.string().describe('A description of the application idea.'),
});
export type GenerateRequirementsFromPromptInput = z.infer<typeof GenerateRequirementsFromPromptInputSchema>;

const RequirementSchema = z.object({
  id: z.string().describe('A unique identifier for the requirement.'),
  type: z.enum(['functional', 'non-functional']).describe('The type of requirement.'),
  description: z.string().describe('A detailed description of the requirement.'),
  priority: z.enum(['high', 'medium', 'low']).describe('The priority of the requirement.'),
});

const GenerateRequirementsFromPromptOutputSchema = z.object({
  requirements: z.array(RequirementSchema).describe('An array of requirements in JSON format.'),
});
export type GenerateRequirementsFromPromptOutput = z.infer<typeof GenerateRequirementsFromPromptOutputSchema>;

export async function generateRequirementsFromPrompt(input: GenerateRequirementsFromPromptInput): Promise<GenerateRequirementsFromPromptOutput> {
  return generateRequirementsFromPromptFlow(input);
}

const generateRequirementsPrompt = ai.definePrompt({
  name: 'generateRequirementsPrompt',
  input: {schema: GenerateRequirementsFromPromptInputSchema},
  output: {schema: GenerateRequirementsFromPromptOutputSchema},
  prompt: `You are a business analyst whose job is to elicit and document requirements.
  Given the following application idea, generate an initial set of requirements in JSON format, including functional and non-functional aspects.  Ensure that the requirements cover a range of aspects, such as user interface, data storage, security, and performance.
  Each requirement should have an ID, type (functional or non-functional), a description, and a priority (high, medium, or low).

  Application Idea: {{{prompt}}}

  Ensure the output is valid JSON.
  `,
});

const generateRequirementsFromPromptFlow = ai.defineFlow(
  {
    name: 'generateRequirementsFromPromptFlow',
    inputSchema: GenerateRequirementsFromPromptInputSchema,
    outputSchema: GenerateRequirementsFromPromptOutputSchema,
  },
  async input => {
    const {output} = await generateRequirementsPrompt(input);
    return output!;
  }
);
