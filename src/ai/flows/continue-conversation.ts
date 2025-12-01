'use server';

/**
 * @fileOverview Elicits and refines software requirements through conversation.
 *
 * - continueConversation - A function that asks clarifying questions and updates requirements.
 */

import { ai } from '@/ai/genkit';
import {
    ContinueConversationInputSchema,
    ContinueConversationOutputSchema,
    type ContinueConversationInput,
    type ContinueConversationOutput
} from '@/lib/types';


export async function continueConversation(
  input: ContinueConversationInput
): Promise<ContinueConversationOutput> {
  return continueConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'continueConversationPrompt',
  input: { schema: ContinueConversationInputSchema },
  output: { schema: ContinueConversationOutputSchema },
  prompt: `You are a friendly and conversational business analyst. Your goal is to elicit software requirements from a user by asking clarifying questions.

Analyze the entire conversation history provided. Your task is to build and maintain a cumulative list of requirements based on everything the user has said so far. When the user provides new information, add to or modify the existing requirements. Do not discard old requirements.

After updating the requirements list, formulate a single, insightful, open-ended follow-up question that will encourage the user to provide more details about a specific aspect of the application.

- If the user has just provided their initial idea, ask a question about the primary goal or main users of the app. For example: "That sounds interesting! Who are the main users you envision for this app?" or "What's the primary problem you're trying to solve with this application?"
- If the user answers a question, ask a follow-up question that digs deeper into their answer. For example, if they say "Users should be able to log in," you could ask, "What kind of information should users provide to sign up?"
- Do not ask more than one question at a time.
- Keep your responses conversational and encouraging.

Return a valid JSON object containing the complete, updated, and cumulative list of all requirements discussed so far, and your next follow-up question.

Conversation History:
{{#each conversationHistory}}
{{role}}: {{content}}
{{/each}}
`,
});

const continueConversationFlow = ai.defineFlow(
  {
    name: 'continueConversationFlow',
    inputSchema: ContinueConversationInputSchema,
    outputSchema: ContinueConversationOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
