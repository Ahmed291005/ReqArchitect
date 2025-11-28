export type Requirement = {
  id: string;
  type: 'functional' | 'non-functional';
  description: string;
  priority: 'high' | 'medium' | 'low';
};

export type ClassifiedRequirement = {
  requirement: string;
  type: 'functional' | 'non-functional';
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  requirements?: Requirement[];
  classifiedRequirements?: ClassifiedRequirement[];
  createdAt: Date;
};
