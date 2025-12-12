"use client";

import Image from "next/image";
import { ThumbsUp, ThumbsDown, MessageCircle, Send, Video } from "lucide-react";
import EchoAvatar from "../_icons/EchoAvatar";

interface PostMessageProps {
  name?: string;
  handle?: string;
  content: React.ReactNode;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  onLike?: () => void;
  onDislike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export default function PostMessage({
  name,
  handle,
  content,
  mediaUrl,
  mediaType = "image",
  onLike,
  onDislike,
  onComment,
  onShare,
}: PostMessageProps) {
  return (
    <div className="w-full rounded-lg border border-[#E8E9ED] bg-white p-4 shadow-sm">
      {/* Header with avatar, name, handle, and dropdown */}
      <div className="mb-3 flex items-start gap-3">
        <div className="shrink-0">
          <EchoAvatar width={40} height={40} />
        </div>
        <div className="flex flex-col items-start justify-between">
          <h3 className="text-sm font-semibold text-[#0D1B3E]">{name}</h3>
          <p className="text-xs text-[#6B7280]">{handle}</p>
        </div>
      </div>

      {/* Post content */}
      <div className="mb-3">
        {content}

        {/* Media attachment */}
        {mediaUrl && (
          <div className="relative mb-3 w-full overflow-hidden rounded-lg bg-[#E8E9ED]">
            <div className="aspect-video w-full bg-gradient-to-br from-blue-100 to-blue-200">
              {/* Placeholder for media - in real app this would be an Image or video component */}
              <div className="flex h-full items-center justify-center">
                {mediaType === "video" && (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-md">
                    <div className="ml-1 h-0 w-0 border-l-[12px] border-l-[#2FE89F] border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent">
                      <Video size={20} strokeWidth={2} />
                    </div>
                  </div>
                )}
                {mediaType === "image" && (
                    <Image
                      src={mediaUrl}
                      alt="Echo post"
                      width={500}
                      height={500}
                      className="w-full h-full object-cover" />
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
            className="flex items-center gap-1 text-[#6B7280] transition-colors hover:text-[#2FE89F]"
            aria-label="Like"
          >
            <ThumbsUp size={20} strokeWidth={2} />
          </button>
          <button
            onClick={onDislike}
            className="flex items-center gap-1 text-[#6B7280] transition-colors hover:text-[#E63946]"
            aria-label="Dislike"
          >
            <ThumbsDown size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onComment}
            className="flex items-center gap-1 text-[#6B7280] transition-colors hover:text-[#0D1B3E]"
            aria-label="Comment"
          >
            <MessageCircle size={20} strokeWidth={2} />
          </button>
          <button
            onClick={onShare}
            className="flex items-center gap-1 text-[#6B7280] transition-colors hover:text-[#0D1B3E]"
            aria-label="Share"
          >
            <Send size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}



