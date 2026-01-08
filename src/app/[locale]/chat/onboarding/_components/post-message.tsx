'use client';

import Image from 'next/image';
import { ThumbsUp, ThumbsDown, MessageCircle, Send, Video } from 'lucide-react';
import EchoAvatar from '../_icons/echo-avatar';
import { cn } from '@/lib/utils';

export interface PostMessageProps {
  name?: string;
  avatar?: React.ReactNode;
  handle?: string;
  content: React.ReactNode;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  className?: string;
  onLike?: () => void;
  onDislike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  likeDisabled?: boolean;
  dislikeDisabled?: boolean;
  commentDisabled?: boolean;
  shareDisabled?: boolean;
}

export default function PostMessage({
  name,
  avatar = <EchoAvatar width={40} height={40} />,
  handle,
  content,
  mediaUrl,
  mediaType = 'image',
  className = '',
  onLike,
  onDislike,
  onComment,
  onShare,
  likeDisabled = false,
  dislikeDisabled = false,
  commentDisabled = false,
  shareDisabled = false,
}: PostMessageProps) {
  return (
    <article className={cn("w-full rounded-lg border border-[#E8E9ED] bg-white p-4 shadow-sm", className)}>
      {/* Header with avatar, name, handle, and dropdown */}
      <header className="mb-3 flex items-start gap-3">
        <div className="shrink-0 w-[40px] h-[40px] flex items-center justify-center" aria-hidden="true">
          {avatar}
        </div>
        <div className="flex flex-col items-start justify-between">
          {name && <h3 className="text-sm font-semibold text-[#0D1B3E]">{name}</h3>}
          {handle && <p className="text-xs text-[#6B7280]">{handle}</p>}
        </div>
      </header>

      {/* Post content */}
      <div className="mb-3">
        {content}

        {/* Media attachment */}
        {mediaUrl && (
          <div className="relative mb-3 w-full overflow-hidden rounded-lg bg-[#E8E9ED]">
            <div className="aspect-video w-full bg-gradient-to-br from-blue-100 to-blue-200">
              {/* Placeholder for media - in real app this would be an Image or video component */}
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
                    alt="Echo post"
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

      {/* Interaction buttons */}
      <div className="flex items-center justify-between border-t border-[#E8E9ED] pt-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onLike}
            disabled={likeDisabled}
            className={cn("flex items-center gap-1 text-[#6B7280] transition-colors hover:text-[#2FE89F]", likeDisabled ? 'opacity-50 cursor-not-allowed' : '')}
            aria-label="Like"
            type="button"
          >
            <ThumbsUp size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            disabled={dislikeDisabled}
            onClick={onDislike}
            className={cn("flex items-center gap-1 text-[#6B7280] transition-colors hover:text-[#E63946]", dislikeDisabled ? 'opacity-50 cursor-not-allowed' : '')}
            aria-label="Dislike"
            type="button"
          >
            <ThumbsDown size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            disabled={commentDisabled}
            onClick={onComment}
            className={cn("flex items-center gap-1 text-[#6B7280] transition-colors hover:text-[#0D1B3E]", commentDisabled ? 'opacity-50 cursor-not-allowed' : '')}
            aria-label="Comment"
            type="button"
          >
            <MessageCircle size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            disabled={shareDisabled}
            onClick={onShare}
            className={cn("flex items-center gap-1 text-[#6B7280] transition-colors hover:text-[#0D1B3E]", shareDisabled ? 'opacity-50 cursor-not-allowed' : '')}
            aria-label="Share"
            type="button"
          >
            <Send size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
