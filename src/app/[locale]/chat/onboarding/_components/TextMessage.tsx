interface TextMessageProps {
  isUser: boolean;
  senderAvatar?: React.ReactNode;
  senderName: string;
  displayText: string;
}

export default function TextMessage({
  isUser, senderAvatar: SenderAvatar, senderName, displayText,
}: TextMessageProps) {

  return (
    <div
      className={`flex w-full gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && SenderAvatar && (
        <div className="flex items-end justify-end">
          {SenderAvatar}
        </div>
      )}

      <div className="flex max-w-[80%] flex-col gap-1 md:max-w-[70%]">
        <div
          className={`px-4 py-3 ${
            isUser
              ? "rounded-l-2xl rounded-tr-2xl bg-[#2FE89F] text-white"
              : "rounded-r-2xl rounded-tl-2xl  border border-[#0D1B3E]/20 bg-white text-[#0D1B3E]"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {displayText}
          </p>
        </div>
        {!isUser && (
          <span className={`text-xs font-medium text-[#0D1B3E]`} >
            {senderName}
          </span>
        )}
      </div>
    </div>
  );
}








