import { z } from 'zod';

export const RequirementSchema = z.object({
  id: z.string().describe('A unique identifier for the requirement.'),
  type: z
    .enum(['functional', 'non-functional', 'domain', 'inverse'])
    .describe('The type of requirement.'),
  description: z
    .string()
    .describe('A detailed description of the requirement.'),
  priority: z
    .enum(['high', 'medium', 'low'])
    .describe('The priority of the requirement.'),
});
export type Requirement = z.infer<typeof RequirementSchema>;

export const ClassifiedRequirementSchema = z.object({
  requirement: z.string().describe('The original requirement.'),
  type: z
    .enum(['functional', 'non-functional', 'domain', 'inverse'])
    .describe('The type of requirement.'),
});
export type ClassifiedRequirement = z.infer<typeof ClassifiedRequirementSchema>;

export const UserStorySchema = z.object({
  userPersona: z
    .string()
    .describe("The user persona, e.g., 'As a user'"),
  feature: z
    .string()
    .describe("The desired feature, e.g., 'I want to be able to log in'"),
  benefit: z
    .string()
    .describe(
      "The benefit of the feature, e.g., 'so that I can access my account'"
    ),
  acceptanceCriteria: z
    .array(z.string())
    .describe('A list of acceptance criteria for the user story.'),
});
export type UserStory = z.infer<typeof UserStorySchema>;

export const StakeholderSchema = z.object({
  role: z
    .string()
    .describe(
      'The name of the stakeholder role (e.g., "End User", "Administrator").'
    ),
  description: z
    .string()
    .describe(
      'A brief description of their interests and involvement in the project.'
    ),
});
export type Stakeholder = z.infer<typeof StakeholderSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  createdAt: z.date(),
  requirements: z.array(RequirementSchema).optional(),
  classifiedRequirements: z.array(ClassifiedRequirementSchema).optional(),
  userStories: z.array(UserStorySchema).optional(),
  stakeholders: z.array(StakeholderSchema).optional(),
});
export type Message = z.infer<typeof MessageSchema>;

// Schemas for AI flows
const FlowMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const ContinueConversationInputSchema = z.object({
  conversationHistory: z
    .array(FlowMessageSchema)
    .describe('The history of the conversation so far.'),
});
export type ContinueConversationInput = z.infer<
  typeof ContinueConversationInputSchema
>;

export const ContinueConversationOutputSchema = z.object({
  updatedRequirements: z
    .array(RequirementSchema)
    .describe('The full, updated list of requirements in JSON format.'),
  followUpQuestion: z
    .string()
    .describe(
      'A relevant, open-ended question to elicit more requirements from the user.'
    ),
});
export type ContinueConversationOutput = z.infer<
  typeof ContinueConversationOutputSchema
>;
