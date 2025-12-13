interface TypingMessageProps {
  senderAvatar?: React.ReactNode;
  senderName?: string;
}

export default function TypingMessage({ senderAvatar: SenderAvatar, senderName }: TypingMessageProps) {
  return (
    <div className="flex w-full gap-3 justify-start">
      {SenderAvatar && <div className="flex items-end justify-end">{SenderAvatar}</div>}

      <div className="flex max-w-[80%] flex-col gap-1 md:max-w-[70%]">
        <div className="rounded-r-2xl rounded-tl-2xl border border-[#2979FF]/20 bg-white px-4 py-3">
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#2979FF]/40 [animation-delay:-0.3s]"></span>
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#2979FF]/40 [animation-delay:-0.15s]"></span>
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#2979FF]/40"></span>
          </div>
        </div>
        {senderName && <span className="text-xs font-medium text-[#0D1B3E]">{senderName}</span>}
      </div>
    </div>
  );
}
