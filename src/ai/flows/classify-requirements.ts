'use server';

/**
 * @fileOverview Classifies a list of requirements into functional and non-functional categories.
 *
 * - classifyRequirements - A function that classifies requirements.
 * - ClassifyRequirementsInput - The input type for the classifyRequirements function.
 * - ClassifyRequirementsOutput - The return type for the classifyRequirements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyRequirementsInputSchema = z.object({
  requirements: z
    .array(z.string())
    .describe('An array of requirements to be classified.'),
});
export type ClassifyRequirementsInput = z.infer<typeof ClassifyRequirementsInputSchema>;

const ClassifyRequirementsOutputSchema = z.object({
  classifiedRequirements: z.array(
    z.object({
      requirement: z.string().describe('The original requirement.'),
      type: z
        .enum(['functional', 'non-functional'])
        .describe('The type of requirement.'),
    })
  ),
});
export type ClassifyRequirementsOutput = z.infer<typeof ClassifyRequirementsOutputSchema>;

export async function classifyRequirements(
  input: ClassifyRequirementsInput
): Promise<ClassifyRequirementsOutput> {
  return classifyRequirementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyRequirementsPrompt',
  input: {schema: ClassifyRequirementsInputSchema},
  output: {schema: ClassifyRequirementsOutputSchema},
  prompt: `You are a business analyst. Your task is to classify a list of requirements into "functional" and "non-functional" types.

Here are the requirements:

{{#each requirements}}
- "{{this}}"
{{/each}}

Classify each requirement and return a JSON object with the following format:

{
  "classifiedRequirements": [
    {
      "requirement": "The original requirement text",
      "type": "functional" | "non-functional"
    },
    ...
  ]
}
`,
});

const classifyRequirementsFlow = ai.defineFlow(
  {
    name: 'classifyRequirementsFlow',
    inputSchema: ClassifyRequirementsInputSchema,
    outputSchema: ClassifyRequirementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
