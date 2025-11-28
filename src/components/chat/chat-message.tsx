import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ChatAvatar } from './chat-avatar';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

function RequirementCard({ requirement }: { requirement: any }) {
  const priorityVariant = {
    high: 'destructive',
    medium: 'default',
    low: 'secondary',
  } as const;

  return (
    <Card className="bg-background/50">
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
            <CardTitle className="text-base">{requirement.type === 'functional' ? 'Functional' : 'Non-Functional'}</CardTitle>
            <Badge variant={priorityVariant[requirement.priority as keyof typeof priorityVariant] || 'secondary'}>{requirement.priority}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm">{requirement.description}</p>
      </CardContent>
    </Card>
  );
}

function ClassifiedRequirementItem({ item }: { item: any }) {
    return (
        <li className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-foreground/80 pr-4">{item.requirement}</span>
            <Badge variant={item.type === 'functional' ? 'outline' : 'secondary'}>{item.type}</Badge>
        </li>
    );
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  if (isLoading) {
    return (
      <div className="flex items-start gap-3">
        <ChatAvatar role="assistant" />
        <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'group flex w-full max-w-[85%] items-start gap-3 data-[new=true]:animate-in data-[new=true]:fade-in data-[new=true]:slide-in-from-bottom-2',
        !isAssistant && 'ml-auto flex-row-reverse'
      )}
    >
      <ChatAvatar role={message.role} />
      <div
        className={cn(
          'flex flex-col gap-1',
          !isAssistant ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-xl px-4 py-2',
            isAssistant
              ? 'bg-muted/50 rounded-bl-sm'
              : 'bg-primary/90 text-primary-foreground rounded-br-sm'
          )}
        >
          {message.content && <p className="text-sm">{message.content}</p>}

          {message.requirements && (
            <div className="mt-4 space-y-2 max-w-xl">
              {message.requirements.map(req => (
                <RequirementCard key={req.id} requirement={req} />
              ))}
            </div>
          )}
          {message.classifiedRequirements && (
            <Card className="mt-4 max-w-xl bg-background/50">
                <CardContent className="p-4">
                    <ul className="space-y-2">
                        {message.classifiedRequirements.map((item, index) => (
                            <ClassifiedRequirementItem key={index} item={item} />
                        ))}
                    </ul>
                </CardContent>
            </Card>
          )}

        </div>
        <span className="text-xs text-muted-foreground">
          {format(message.createdAt, 'h:mm a')}
        </span>
      </div>
    </div>
  );
}
