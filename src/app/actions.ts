'use server';

import {
  generateRequirementsFromPrompt,
  GenerateRequirementsFromPromptOutput,
} from '@/ai/flows/generate-requirements-from-prompt';
import { improveRequirements } from '@/ai/flows/improve-requirements';
import {
  classifyRequirements as classifyRequirementsFlow,
  ClassifyRequirementsOutput,
} from '@/ai/flows/classify-requirements';
import {
  generateUserStories as generateUserStoriesFlow,
  GenerateUserStoriesOutput,
} from '@/ai/flows/generate-user-stories';
import {
  identifyStakeholders as identifyStakeholdersFlow,
  IdentifyStakeholdersOutput,
} from '@/ai/flows/identify-stakeholders';
import {
  speakRequirements as speakRequirementsFlow,
  SpeakRequirementsOutput,
} from '@/ai/flows/speak-requirements';
import type { Requirement, ClassifiedRequirement, Stakeholder } from '@/lib/types';

export async function generateInitialRequirements(
  prompt: string
): Promise<GenerateRequirementsFromPromptOutput> {
  const result = await generateRequirementsFromPrompt({ prompt });
  return result;
}

export async function continueConversation(
  userInput: string,
  currentRequirements: Requirement[]
): Promise<{ requirements: Requirement[] }> {
  const requirementsString = JSON.stringify(currentRequirements, null, 2);
  const prompt = `You are a business analyst. Your task is to update a list of software requirements based on user feedback.
Analyze the "Current Requirements" and the "User Feedback" provided below.
Produce a new, complete list of requirements in JSON format that incorporates the user's feedback.
The user's feedback might be to add, remove, or modify requirements.
Your output MUST be a valid JSON array of requirement objects, and nothing else. Do not wrap it in markdown or other text.

Current Requirements (JSON):
${requirementsString}

User Feedback:
"${userInput}"
`;
  try {
    const improveResult = await improveRequirements({ requirements: prompt });
    
    const jsonMatch = improveResult.improvedRequirements.match(/(\[[\s\S]*\])/);
    if (!jsonMatch) {
      throw new Error('AI did not return a valid JSON array.');
    }

    const parsedRequirements = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsedRequirements)) {
      throw new Error('Could not extract requirements array from AI response.');
    }
    
    // Zod-like validation for safety
    const validatedRequirements = parsedRequirements.filter(
      (req: any) => 
        typeof req.id === 'string' &&
        (req.type === 'functional' || req.type === 'non-functional') &&
        typeof req.description === 'string' &&
        (req.priority === 'high' || req.priority === 'medium' || req.priority === 'low')
    );

    return { requirements: validatedRequirements as Requirement[] };
  } catch (e) {
    console.error('Failed to parse improved requirements:', e);
    throw new Error(
      'I had trouble understanding how to update the requirements. Could you please try rephrasing?'
    );
  }
}

export async function classifyRequirements(
  requirements: Requirement[]
): Promise<ClassifyRequirementsOutput> {
  const requirementDescriptions = requirements.map(r => r.description);
  const result = await classifyRequirementsFlow({
    requirements: requirementDescriptions,
  });
  return result;
}

export async function generateUserStories(
  classifiedRequirements: ClassifiedRequirement[]
): Promise<GenerateUserStoriesOutput> {
  const functionalRequirements = classifiedRequirements
    .filter(r => r.type === 'functional')
    .map(r => r.requirement);

  if (functionalRequirements.length === 0) {
    return { userStories: [] };
  }

  const result = await generateUserStoriesFlow({
    requirements: functionalRequirements,
  });
  return result;
}

export async function identifyStakeholders(
  requirements: Requirement[]
): Promise<IdentifyStakeholdersOutput> {
  const requirementDescriptions = requirements.map(r => r.description);
  const result = await identifyStakeholdersFlow({
    requirements: requirementDescriptions,
  });
  return result;
}

export async function speakRequirements(
  requirements: Requirement[]
): Promise<SpeakRequirementsOutput> {
  const result = await speakRequirementsFlow({ requirements });
  return result;
}
