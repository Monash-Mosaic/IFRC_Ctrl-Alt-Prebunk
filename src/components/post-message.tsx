'use client';

import Image from 'next/image';
import { Video } from 'lucide-react';
import type { User } from '@/contents/en';
import { cn } from '@/lib/utils';

export interface PostMessageProps {
  user: User;
  content: React.ReactNode;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  mediaAlt?: string;
  className?: string;
  interaction?: React.ReactNode;
}

export default function PostMessage({
  user,
  content,
  mediaUrl,
  mediaType = 'image',
  mediaAlt = 'Echo post',
  className,
  interaction,
}: PostMessageProps) {
  return (
    <article
      className={cn(
        // Auto margins center short cards in the feed without clipping taller cards.
        'my-auto w-full shrink-0 rounded-lg border border-[#E8E9ED] bg-white p-4 shadow-sm',
        className
      )}
    >
      <header className="mb-3 flex items-start gap-3">
        <div
          className="shrink-0 w-[40px] h-[40px] flex items-center justify-center"
          aria-hidden="true"
        >
          {user.avatar}
        </div>
        <div className="flex flex-col items-start justify-between">
          {user.name && <h3 className="text-sm font-semibold text-[#0D1B3E]">{user.name}</h3>}
          {user.handle && <p className="text-xs text-[#6B7280]">{user.handle}</p>}
        </div>
      </header>

      <div className="mb-3">
        {content}

        {mediaUrl && (
          <div className="relative mb-3 w-full overflow-hidden rounded-lg bg-[#E8E9ED]">
            <div className="aspect-video w-full bg-gradient-to-br from-blue-100 to-blue-200">
              <div className="flex h-full items-center justify-center">
                {mediaType === 'video' && (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-md">
                    <div className="ml-1 h-0 w-0 border-l-[12px] border-l-[#2FE89F] border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent">
                      <Video size={20} strokeWidth={2} />
                    </div>
                  </div>
                )}
                {mediaType === 'image' && (
                  <Image
                    src={mediaUrl}
                    alt={mediaAlt}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {interaction}
    </article>
  );
}
