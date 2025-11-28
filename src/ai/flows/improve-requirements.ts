// src/ai/flows/improve-requirements.ts
'use server';

/**
 * @fileOverview Flow for improving existing requirements using GenAI.
 *
 * This file defines a Genkit flow that takes a set of requirements as input and uses GenAI to suggest improvements,
 * identify gaps, and refine the specifications. The flow returns an improved set of requirements.
 *
 * @exports {function} improveRequirements - The main function to trigger the flow.
 * @exports {ImproveRequirementsInput} ImproveRequirementsInput - The input type for the improveRequirements function.
 * @exports {ImproveRequirementsOutput} ImproveRequirementsOutput - The output type for the improveRequirements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const ImproveRequirementsInputSchema = z.object({
  requirements: z
    .string()
    .describe('The current set of requirements as a string.'),
});

export type ImproveRequirementsInput = z.infer<typeof ImproveRequirementsInputSchema>;

// Define the output schema
const ImproveRequirementsOutputSchema = z.object({
  improvedRequirements: z
    .string()
    .describe('The improved set of requirements.'),
});

export type ImproveRequirementsOutput = z.infer<typeof ImproveRequirementsOutputSchema>;

// Define the main function to trigger the flow
export async function improveRequirements(
  input: ImproveRequirementsInput
): Promise<ImproveRequirementsOutput> {
  return improveRequirementsFlow(input);
}

// Define the prompt
const improveRequirementsPrompt = ai.definePrompt({
  name: 'improveRequirementsPrompt',
  input: {schema: ImproveRequirementsInputSchema},
  output: {schema: ImproveRequirementsOutputSchema},
  prompt: `You are a business analyst tasked with improving a set of requirements.

  Please analyze the following requirements and suggest improvements, identify gaps, and refine the specifications to ensure they are comprehensive and well-defined. The improved requirements should be clear, concise, and testable.

  Current Requirements: {{{requirements}}}

  Improved Requirements:`,
});

// Define the flow
const improveRequirementsFlow = ai.defineFlow(
  {
    name: 'improveRequirementsFlow',
    inputSchema: ImproveRequirementsInputSchema,
    outputSchema: ImproveRequirementsOutputSchema,
  },
  async input => {
    const {output} = await improveRequirementsPrompt(input);
    return output!;
  }
);
