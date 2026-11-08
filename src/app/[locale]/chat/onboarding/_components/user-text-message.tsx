import { CheckCheck } from 'lucide-react';

interface UserTextMessageProps {
  displayText: string;
  sentAt?: string;
}

export default function UserTextMessage({ displayText, sentAt }: UserTextMessageProps) {
  return (
    <div className="flex w-full gap-3 justify-end">
      <div className="w-full flex-col gap-1 md:max-w-[70%]">
        <div className="flex justify-end">
          <div className="flex px-4 py-3 rounded-l-2xl rounded-tr-2xl border border-[#00FF9C] bg-[#00FF9C]/10">
            <p className="whitespace-pre-wrap text-medium leading-relaxed">{displayText}</p>
          </div>
        </div>
        {sentAt && (
          <span className="mt-1 flex items-center justify-end gap-1 text-xs text-[#7A7A7A]">
            <CheckCheck size={14} strokeWidth={2.5} className="text-[#005FFF]" aria-hidden />
            {sentAt}
          </span>
        )}
      </div>
    </div>
  );
}
