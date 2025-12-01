'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Message } from '@/lib/types';
import Image from 'next/image';

const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
const botAvatar = PlaceHolderImages.find(p => p.id === 'bot-avatar');

interface ChatAvatarProps {
  role: Message['role'];
}

export function ChatAvatar({ role }: ChatAvatarProps) {
  if (role === 'user') {
    return (
      <Avatar className="h-8 w-8">
        {userAvatar && (
            <Image 
                src={userAvatar.imageUrl} 
                alt={userAvatar.description} 
                data-ai-hint={userAvatar.imageHint}
                width={32}
                height={32}
                className='object-cover'
            />
        )}
        <AvatarFallback>
          <User />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
        {botAvatar && (
            <AvatarImage 
                src={botAvatar.imageUrl} 
                alt={botAvatar.description} 
                data-ai-hint={botAvatar.imageHint}
            />
        )}
      <AvatarFallback className="bg-primary text-primary-foreground">
        <Bot />
      </AvatarFallback>
    </Avatar>
  );
}
