'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Message } from '@/lib/types';
import Image from 'next/image';

const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

interface ChatAvatarProps {
  role: Message['role'];
}

const BotAvatar = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);


const BotIcon = () => (
    <svg fill="#FFFFFF" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M24.732 19.311c0.414 0 0.75-0.336 0.75-0.75v-3.322c0-0.414-0.336-0.75-0.75-0.75s-0.75 0.336-0.75 0.75v3.322c0 0.414 0.336 0.75 0.75 0.75zM7.268 19.311c0.414 0 0.75-0.336 0.75-0.75v-3.322c0-0.414-0.336-0.75-0.75-0.75s-0.75 0.336-0.75 0.75v3.322c0 0.414 0.336 0.75 0.75 0.75zM17.848 16.328c0 0.414-0.336 0.75-0.75 0.75h-2.197c-0.414 0-0.75-0.336-0.75-0.75s0.336-0.75 0.75-0.75h2.197c0.414 0 0.75 0.336 0.75 0.75zM22.924 23.498c-0.128 0-0.256-0.049-0.354-0.146l-2.039-2.039c-0.195-0.195-0.195-0.512 0-0.707s0.512-0.195 0.707 0l2.039 2.039c0.195 0.195 0.195 0.512 0 0.707-0.098 0.098-0.226 0.146-0.354 0.146zM16 28.5c-6.892 0-12.5-5.607-12.5-12.5s5.608-12.5 12.5-12.5c6.892 0 12.5 5.607 12.5 12.5s-5.608 12.5-12.5 12.5zM16 4.5c-6.341 0-11.5 5.159-11.5 11.5s5.159 11.5 11.5 11.5c6.341 0 11.5-5.159 11.5-11.5s-5.159-11.5-11.5-11.5zM22.25 10.875c-0.621 0-1.125-0.504-1.125-1.125s0.504-1.125 1.125-1.125c0.621 0 1.125 0.504 1.125 1.125s-0.504 1.125-1.125 1.125zM9.75 10.875c-0.621 0-1.125-0.504-1.125-1.125s0.504-1.125 1.125-1.125c0.621 0 1.125 0.504 1.125 1.125s-0.504 1.125-1.125 1.125z"></path> </g></svg>
);


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
    <Avatar className="h-8 w-8 bg-primary text-primary-foreground p-1">
        <BotIcon />
      <AvatarFallback className="bg-primary text-primary-foreground">
        <BotAvatar />
      </AvatarFallback>
    </Avatar>
  );
}
