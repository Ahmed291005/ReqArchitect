'use server';

import {
  continueConversation as continueConversationFlow,
  ContinueConversationOutput,
} from '@/ai/flows/continue-conversation';

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
import type {
  Requirement,
  ClassifiedRequirement,
  Message,
} from '@/lib/types';


export async function continueConversation(
  conversationHistory: Message[]
): Promise<ContinueConversationOutput> {
  const result = await continueConversationFlow({ conversationHistory });
  return result;
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
