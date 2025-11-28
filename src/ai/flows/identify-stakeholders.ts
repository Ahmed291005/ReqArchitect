'use server';

/**
 * @fileOverview Identifies potential stakeholders and user roles from a list of requirements.
 *
 * - identifyStakeholders - A function that identifies stakeholders.
 * - IdentifyStakeholdersInput - The input type for the identifyStakeholders function.
 * - IdentifyStakeholdersOutput - The return type for the identifyStakeholders function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IdentifyStakeholdersInputSchema = z.object({
  requirements: z
    .array(z.string())
    .describe('An array of requirements to analyze for stakeholders.'),
});
export type IdentifyStakeholdersInput = z.infer<typeof IdentifyStakeholdersInputSchema>;

const StakeholderSchema = z.object({
  role: z.string().describe('The name of the stakeholder role (e.g., "End User", "Administrator").'),
  description: z.string().describe('A brief description of their interests and involvement in the project.'),
});

const IdentifyStakeholdersOutputSchema = z.object({
  stakeholders: z.array(StakeholderSchema),
});
export type IdentifyStakeholdersOutput = z.infer<typeof IdentifyStakeholdersOutputSchema>;

export async function identifyStakeholders(input: IdentifyStakeholdersInput): Promise<IdentifyStakeholdersOutput> {
  return identifyStakeholdersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyStakeholdersPrompt',
  input: { schema: IdentifyStakeholdersInputSchema },
  output: { schema: IdentifyStakeholdersOutputSchema },
  prompt: `You are a senior business analyst. Your task is to identify potential stakeholders and user roles based on a list of software requirements.
For each stakeholder, provide their role and a brief description of their likely interests and involvement in the project.

Here are the requirements:

{{#each requirements}}
- "{{this}}"
{{/each}}

Identify the stakeholders and return a JSON object.
`,
});

const identifyStakeholdersFlow = ai.defineFlow(
  {
    name: 'identifyStakeholdersFlow',
    inputSchema: IdentifyStakeholdersInputSchema,
    outputSchema: IdentifyStakeholdersOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
