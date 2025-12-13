'use client';

interface OptionButtonProps {
  id: string;
  displayText: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function OptionButton({ id, displayText, onClick }: OptionButtonProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-[#F5F5F5] px-4 py-3 text-left text-sm font-medium text-[#0D1B3E] transition-all hover:bg-[#E8E9ED] focus:outline-none focus:ring-2 focus:ring-[#2FE89F] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
      aria-label={displayText}
    >
      <span className="flex-1">{displayText}</span>
    </button>
  );
}
