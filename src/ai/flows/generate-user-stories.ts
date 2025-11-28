'use server';

/**
 * @fileOverview Generates user stories from a list of functional requirements.
 *
 * - generateUserStories - A function that generates user stories.
 * - GenerateUserStoriesInput - The input type for the generateUserStories function.
 * - GenerateUserStoriesOutput - The return type for the generateUserStories function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateUserStoriesInputSchema = z.object({
  requirements: z
    .array(z.string())
    .describe('An array of functional requirements to be converted into user stories.'),
});
export type GenerateUserStoriesInput = z.infer<typeof GenerateUserStoriesInputSchema>;

const UserStorySchema = z.object({
  userPersona: z.string().describe("The user persona, e.g., 'As a user'"),
  feature: z.string().describe("The desired feature, e.g., 'I want to be able to log in'"),
  benefit: z.string().describe("The benefit of the feature, e.g., 'so that I can access my account'"),
  acceptanceCriteria: z.array(z.string()).describe("A list of acceptance criteria for the user story."),
});

const GenerateUserStoriesOutputSchema = z.object({
  userStories: z.array(UserStorySchema),
});
export type GenerateUserStoriesOutput = z.infer<typeof GenerateUserStoriesOutputSchema>;

export async function generateUserStories(input: GenerateUserStoriesInput): Promise<GenerateUserStoriesOutput> {
  return generateUserStoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUserStoriesPrompt',
  input: { schema: GenerateUserStoriesInputSchema },
  output: { schema: GenerateUserStoriesOutputSchema },
  prompt: `You are an expert business analyst. Your task is to convert a list of functional software requirements into user stories.
Each user story must follow the format: "As a [user persona], I want [feature], so that [benefit]."
Also, provide a list of acceptance criteria for each user story.

Here are the functional requirements:

{{#each requirements}}
- "{{this}}"
{{/each}}

Generate user stories for each requirement and return a JSON object.
`,
});

const generateUserStoriesFlow = ai.defineFlow(
  {
    name: 'generateUserStoriesFlow',
    inputSchema: GenerateUserStoriesInputSchema,
    outputSchema: GenerateUserStoriesOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
