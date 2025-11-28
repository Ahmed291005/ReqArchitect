'use client';

import { useState, useRef, useEffect } from 'react';
import {
  generateInitialRequirements,
  continueConversation,
  classifyRequirements,
  generateUserStories,
} from '@/app/actions';
import type { Requirement, Message, ClassifiedRequirement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatInput } from './chat-input';
import { ChatMessage } from './chat-message';
import { Code2, Bot, Users } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import { useToast } from '@/hooks/use-toast';

const initialMessages: Message[] = [
  {
    id: crypto.randomUUID(),
    role: 'assistant',
    content:
      "Hello! I'm ReqBot, your personal business analyst. Describe your application idea, and I'll help you generate a set of initial requirements.",
    createdAt: new Date(),
  },
];

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [classifiedRequirements, setClassifiedRequirements] = useState<
    ClassifiedRequirement[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
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

  const handleSendMessage = async (input: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let assistantResponse: Message;
      if (requirements.length === 0) {
        const result = await generateInitialRequirements(input);
        setRequirements(result.requirements);
        assistantResponse = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            "Great! Here are the initial requirements I've generated. You can ask me to add, remove, or modify them. When you are happy, click 'Finalize & Classify'.",
          requirements: result.requirements,
          createdAt: new Date(),
        };
      } else {
        const result = await continueConversation(input, requirements);
        setRequirements(result.requirements);
        assistantResponse = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'I have updated the requirements based on your feedback.',
          requirements: result.requirements,
          createdAt: new Date(),
        };
      }
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
      setClassifiedRequirements(result.classifiedRequirements);
      const assistantResponse: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          "I've classified the requirements into functional and non-functional categories. You can now generate user stories from the functional requirements.",
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
        description:
          'Please finalize and classify the requirements first.',
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

  return (
    <div className="flex h-[100dvh] w-full flex-col">
      <header className="flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold tracking-tight font-headline">ReqBot Chat</h1>
        </div>
        <ThemeToggle />
      </header>
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
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
      </main>
      <footer className="border-t bg-background/95 p-4 backdrop-blur-sm">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-start gap-4">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading || hasBeenClassified}
            />
            {!hasBeenClassified ? (
              <Button
                variant="outline"
                onClick={handleFinalize}
                disabled={isLoading || requirements.length === 0}
                className="shrink-0"
              >
                <Code2 className="mr-2 h-4 w-4" />
                Finalize & Classify
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleGenerateStories}
                disabled={isLoading}
                className="shrink-0"
              >
                <Users className="mr-2 h-4 w-4" />
                Generate User Stories
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
