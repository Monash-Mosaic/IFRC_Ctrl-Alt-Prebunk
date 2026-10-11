interface UserTextMessageProps {
  displayText: string;
  senderAvatar?: React.ReactNode;
}

export default function UserTextMessage({ displayText, senderAvatar }: UserTextMessageProps) {
  return (
    <div className="flex w-full gap-3 justify-end">
      <div className="w-full flex-col gap-1 md:max-w-[70%]">
        <div className="flex justify-end">
          <div className="flex px-4 py-3 rounded-l-2xl rounded-tr-2xl border border-[#00FF9C] bg-[#00FF9C]/10">
            <p className="whitespace-pre-wrap text-medium leading-relaxed">{displayText}</p>
          </div>
        </div>
      </div>
      {senderAvatar && <div className="flex items-end">{senderAvatar}</div>}
    </div>
  );
}
