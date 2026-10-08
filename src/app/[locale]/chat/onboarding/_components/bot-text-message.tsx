import { ThumbsUp } from 'lucide-react';

interface BotTextMessageProps {
  senderAvatar?: React.ReactNode;
  senderName: string;
  displayText: string;
  reaction?: boolean;
}

export default function BotTextMessage({
  senderAvatar: SenderAvatar,
  senderName,
  displayText,
  reaction,
}: BotTextMessageProps) {
  return (
    <div className="flex w-full gap-3 justify-start">
      {SenderAvatar && <div className="flex items-end justify-end">{SenderAvatar}</div>}

      <div className="flex max-w-[80%] flex-col gap-1 md:max-w-[70%]">
        {reaction ? (
          <div className="relative w-fit max-w-full">
            <div className="flex px-4 py-3 rounded-r-2xl rounded-tl-2xl border border-[#2979FF] bg-[#2979FF]/10 text-black">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{displayText}</p>
            </div>
            <span
              aria-label="Reaction"
              className="absolute -right-2 -top-3 flex h-[30px] w-6 items-center justify-center rounded-full rounded-bl-sm bg-[#F2F2F2]"
            >
              <ThumbsUp size={12} className="fill-[#005FFF] text-[#005FFF]" aria-hidden />
            </span>
          </div>
        ) : (
          <div className="flex px-4 py-3 rounded-r-2xl rounded-tl-2xl border border-[#2979FF] bg-[#2979FF]/10 text-black">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{displayText}</p>
          </div>
        )}
        <span className="text-xs font-medium text-[#2979FF]">{senderName}</span>
      </div>
    </div>
  );
}
