export default function Loading({ displayText }: { displayText: string }) {

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center">
      <div
        className="flex items-center justify-center"
        role="status"
        aria-label={displayText}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute h-12 w-12 animate-spin rounded-full border-4 border-[#E8E9ED] border-t-[#2FE89F]" />
          </div>
          <p className="text-sm text-[#0D1B3E]">{displayText}</p>
        </div>
      </div>
    </div>
  );
}
