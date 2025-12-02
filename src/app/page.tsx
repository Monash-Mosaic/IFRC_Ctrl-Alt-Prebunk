export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center p-6">
      {/* Placeholder illustration area */}
      <div className="mb-8 flex h-64 w-full max-w-md items-center justify-center rounded-2xl border-2 border-dashed border-[#C5C9D3] bg-[#F8F9FA]">
        <span className="text-sm text-[#6B7280]">Illustration goes here</span>
      </div>

      {/* CTA Buttons */}
      <div className="flex w-full max-w-md flex-col gap-4">
        <button
          type="button"
          className="h-14 w-full rounded-full bg-[#2FE89F] font-semibold text-[#0D1B3E] transition-all hover:bg-[#26D98F] hover:shadow-lg hover:shadow-[#2FE89F]/30"
        >
          Start onboarding chat with Paula
        </button>
        <button
          type="button"
          className="h-14 w-full rounded-full border-2 border-dashed border-[#C5C9D3] bg-[#E8E9ED] font-semibold text-[#0D1B3E] transition-all hover:border-[#9CA3AF] hover:bg-[#DDDFE4]"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
