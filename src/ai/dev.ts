import { config } from 'dotenv';
config();

import '@/ai/flows/classify-requirements.ts';
import '@/ai/flows/generate-requirements-from-prompt.ts';
import '@/ai/flows/continue-conversation.ts';
import '@/ai/flows/generate-user-stories.ts';
import '@/ai/flows/identify-stakeholders.ts';
import '@/ai/flows/speak-requirements.ts';
