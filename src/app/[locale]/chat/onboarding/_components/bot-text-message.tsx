interface BotTextMessageProps {
  senderAvatar?: React.ReactNode;
  senderName: string;
  displayText: string;
}

export default function BotTextMessage({
  senderAvatar: SenderAvatar,
  senderName,
  displayText,
}: BotTextMessageProps) {
  return (
    <div className="flex w-full gap-3 justify-start">
      {SenderAvatar && <div className="flex items-end justify-end">{SenderAvatar}</div>}

      <div className="w-full flex-col gap-1 md:max-w-[70%]">
        <div className="flex justify-end">
          <div className="flex px-4 py-3 rounded-r-2xl rounded-tl-2xl border border-[#2979FF] bg-white text-black">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{displayText}</p>
          </div>
        </div>
        <span className="text-xs font-medium text-[#2979FF]">{senderName}</span>
      </div>
    </div>
  );
}
