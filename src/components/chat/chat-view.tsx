'use client';

import { useState, useRef, useEffect } from 'react';
import {
  continueConversation,
  classifyRequirements,
  generateUserStories,
  identifyStakeholders,
  speakRequirements,
} from '@/app/actions';
import type { Message, ClassifiedRequirement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatInput } from './chat-input';
import { ChatMessage } from './chat-message';
import { Code2, Bot, Users, UserCog, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { useAppContext } from '@/context/app-state-provider';
import type { Requirement } from '@/lib/types';

const initialMessages: Message[] = [
  {
    id: crypto.randomUUID(),
    role: 'assistant',
    content:
      "Hello! I'm ReqBot, your personal business analyst. To start, please describe your application idea.",
    createdAt: new Date(),
  },
];

function RequirementsDisplay({
  requirements,
}: {
  requirements: Requirement[];
}) {
  if (requirements.length === 0) return null;

  const priorityVariant = {
    high: 'destructive',
    medium: 'default',
    low: 'secondary',
  } as const;

  return (
    <>
      <Card className="mt-4 w-full">
        <CardHeader>
          <CardTitle>Current Requirements</CardTitle>
          <CardDescription>
            Here is the list of requirements we've built so far.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {requirements.map(req => (
              <li
                key={req.id}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{req.description}</p>
                  <p className="text-xs text-muted-foreground">{req.type}</p>
                </div>
                <Badge
                  variant={
                    priorityVariant[
                      req.priority as keyof typeof priorityVariant
                    ]
                  }
                  className="ml-4"
                >
                  {req.priority}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}


export function ChatView() {
  const { 
    requirements, 
    setRequirements,
    classifiedRequirements,
    setClassifiedRequirements,
   } = useAppContext();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const hasBeenClassified = classifiedRequirements.length > 0;
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioUrl]);

  const handleSendMessage = async (input: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    };

    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
        const conversationForAI = newMessages.map(
          // Strip out the complex data fields before sending to the AI
          ({ requirements, classifiedRequirements, userStories, stakeholders, ...rest }) => rest
        );
      
        const result = await continueConversation(conversationForAI);

        const updatedRequirements = result.updatedRequirements || [];
        setRequirements(updatedRequirements);

        const assistantResponse: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: result.followUpQuestion,
            createdAt: new Date(),
          };

        setMessages(prev => [...prev, assistantResponse]);

    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: errorMessage,
      });
      const assistantErrorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, assistantErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (requirements.length === 0) {
      toast({
        title: 'No requirements to classify',
        description:
          'Please describe your app idea first to generate some requirements.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await classifyRequirements(requirements);
      const requirementMap = new Map(
        result.classifiedRequirements.map(cr => [cr.requirement, cr.type])
      );
      
      const updatedReqs = requirements.map(req => ({
        ...req,
        type: requirementMap.get(req.description) || req.type,
      }));

      setRequirements(updatedReqs);
      setClassifiedRequirements(result.classifiedRequirements);

      const assistantResponse: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          "I've classified the requirements and updated the repository. You can view the classified requirements on the Dashboard page or generate user stories from them.",
        classifiedRequirements: result.classifiedRequirements,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, assistantResponse]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Classification Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateStories = async () => {
    if (classifiedRequirements.length === 0) {
      toast({
        title: 'No classified requirements',
        description: 'Please classify the requirements first.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateUserStories(classifiedRequirements);
      const assistantResponse: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          result.userStories.length > 0
            ? "Here are the user stories I've generated based on the functional requirements:"
            : 'There were no functional requirements to generate user stories from.',
        userStories: result.userStories,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, assistantResponse]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Failed to Generate User Stories',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdentifyStakeholders = async () => {
    if (requirements.length === 0) {
      toast({
        title: 'No requirements to analyze',
        description:
          'Please describe your app idea first to generate some requirements.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await identifyStakeholders(requirements);
      const assistantResponse: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          "Here are the potential stakeholders I've identified based on the requirements:",
        stakeholders: result.stakeholders,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, assistantResponse]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Failed to Identify Stakeholders',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakRequirements = async () => {
    if (requirements.length === 0) {
      toast({
        title: 'No requirements to speak',
        description: 'Please generate some requirements first.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await speakRequirements(requirements);
      setAudioUrl(result.audio);
      const assistantResponse: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm reading the requirements out loud now.",
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, assistantResponse]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Failed to generate audio',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="container mx-auto max-w-3xl space-y-6 p-4">
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <ChatMessage
                message={{
                  id: 'loading',
                  role: 'assistant',
                  content: '',
                  createdAt: new Date(),
                }}
                isLoading
              />
            )}
          </div>
        </ScrollArea>
        <div className="border-t bg-background/95 p-4 backdrop-blur-sm">
          <div className="container mx-auto max-w-3xl">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
      <aside className="w-1/3 border-l overflow-y-auto p-4">
         <RequirementsDisplay requirements={requirements} />
         <div className="mt-4 flex flex-col gap-2">
         <Button
              variant="outline"
              onClick={handleFinalize}
              disabled={isLoading || requirements.length === 0}
              className="shrink-0"
            >
              <Code2 className="mr-2 h-4 w-4" />
              Classify Requirements
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerateStories}
              disabled={isLoading || !hasBeenClassified}
              className="shrink-0"
            >
              <Users className="mr-2 h-4 w-4" />
              Generate User Stories
            </Button>
            <Button
              variant="outline"
              onClick={handleIdentifyStakeholders}
              disabled={isLoading || requirements.length === 0}
              className="shrink-0"
            >
              <UserCog className="mr-2 h-4 w-4" />
              Identify Stakeholders
            </Button>
             <Button
              variant="outline"
              onClick={handleSpeakRequirements}
              disabled={isLoading || requirements.length === 0}
              className="shrink-0"
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Speak Requirements
            </Button>
         </div>
      </aside>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setAudioUrl(null)}
          className="hidden"
        />
      )}
    </div>
  );
}
