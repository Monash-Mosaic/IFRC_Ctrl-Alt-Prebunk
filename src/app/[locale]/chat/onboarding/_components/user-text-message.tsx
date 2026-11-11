import { cn } from "@/lib/utils";

interface UserTextMessageProps {
  displayText: string;
  isIncorrect?: boolean;
}

export default function UserTextMessage({ displayText, isIncorrect = false }: UserTextMessageProps) {
  return (
    <div className="flex w-full gap-3 justify-end">
      <div className="w-full flex-col gap-1 md:max-w-[70%]">
        <div className="flex justify-end">
          <div
            className={cn(
              'flex px-4 py-3 rounded-l-2xl rounded-tr-2xl border',
              isIncorrect ? 'border-[#FF1E56] bg-[#EE24351A]' : 'border-[#00FF9C] bg-[#00FF9C]/10'
            )}
          >
            <p className="whitespace-pre-wrap text-medium leading-relaxed">{displayText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
