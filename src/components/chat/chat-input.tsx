'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import React from 'react';

const formSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    form.setValue('message', textarea.value);
  };
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSendMessage(values.message);
    form.reset();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full items-start space-x-2"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea
                  {...field}
                  ref={textareaRef}
                  placeholder="Describe your app idea..."
                  className="max-h-36 min-h-[40px] resize-none"
                  rows={1}
                  disabled={isLoading}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </Form>
  );
}
