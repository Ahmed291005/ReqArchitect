'use client';

import { useState, useRef, useEffect } from 'react';
import {
  continueConversation,
  generateReport,
} from '@/app/actions';
import type { Message, Requirement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatInput } from './chat-input';
import { ChatMessage } from './chat-message';
import { FileText } from 'lucide-react';
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
import { useRouter } from 'next/navigation';

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
    setUserStories,
    setStakeholders,
   } = useAppContext();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

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

  const handleGenerateReport = async () => {
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
      const { classifiedResult, userStories, stakeholders } = await generateReport(requirements, classifiedRequirements);
      
      const requirementMap = new Map(
        classifiedResult.map(cr => [cr.requirement, cr.type])
      );

      const typeOrder: Record<string, number> = {
        functional: 1,
        'non-functional': 2,
        domain: 3,
        inverse: 4,
      };
      
      const updatedReqs = requirements
        .map(req => ({
          ...req,
          type: requirementMap.get(req.description) || req.type,
        }))
        .sort((a, b) => (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99));

      setRequirements(updatedReqs);
      setClassifiedRequirements(classifiedResult);
      setUserStories(userStories);
      setStakeholders(stakeholders);

      const assistantResponse: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          "I've generated a full report which includes classified requirements, user stories, and project stakeholders. You can now view this report on the Dashboard page.",
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, assistantResponse]);
      router.push('/dashboard');

    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Failed to Generate Report',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-1 overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1" viewportRef={viewportRef}>
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
              onClick={handleGenerateReport}
              disabled={isLoading || requirements.length === 0}
              className="shrink-0"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
         </div>
      </aside>
    </div>
  );
}
