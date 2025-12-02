"use client";

interface HeaderProps {
  points?: number;
  credibility?: number;
}

export default function Header({ points = 0, credibility = 80 }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#E8E9ED]">
      {/* Main Header Row */}
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Left: IFRC Logo */}
        <div className="flex items-center gap-2">
          {/* IFRC Logo */}
          <div className="flex items-center gap-1">
            <svg
              width="32"
              height="32"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              {/* Red Cross */}
              <rect x="16" y="4" width="8" height="32" fill="#E63946" />
              <rect x="4" y="16" width="32" height="8" fill="#E63946" />
              {/* Red Crescent (simplified) */}
              <path
                d="M32 20c0 6.627-5.373 12-12 12"
                stroke="#E63946"
                strokeWidth="3"
                fill="none"
                className="hidden"
              />
            </svg>
            <div className="hidden flex-col md:flex">
              <span className="text-xs font-bold text-[#E63946]">IFRC</span>
              <span className="text-[10px] leading-tight text-[#0D1B3E]">
                solferino
                <br />
                academy
              </span>
            </div>
          </div>
        </div>

        {/* Center: Title */}
        <h1 className="font-mono text-lg font-bold tracking-wider text-[#E63946] md:text-2xl">
          <span className="hidden md:inline">CTRL + ALT + PREBUNK</span>
          <span className="md:hidden">US!</span>
        </h1>

        {/* Right: Partner Logos (Desktop only) */}
        <div className="hidden items-center gap-4 md:flex">
          {/* Monash Logo */}
          <div className="flex items-center gap-1">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" fill="#0D1B3E" />
              <path d="M8 8l4 4-4 4M12 8l4 4-4 4" stroke="white" strokeWidth="1.5" />
            </svg>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#0D1B3E]">MONASH</span>
              <span className="text-[8px] text-[#0D1B3E]">University</span>
            </div>
          </div>
          {/* MOSAIC Logo */}
          <div className="border-l border-[#0D1B3E]/20 pl-3">
            <span className="text-sm font-bold tracking-wide text-[#0D1B3E]">
              MOSAIC
            </span>
          </div>
        </div>

        {/* Mobile: Empty space for balance */}
        <div className="w-8 md:hidden" />
      </div>

      {/* Points and Credibility Bar */}
      <div className="flex h-10 items-center gap-4 border-t border-white/50 bg-[#E8E9ED] px-4 md:px-6">
        {/* Points */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#0D1B3E]">Points: {points}</span>
          {/* Badge circles */}
          <div className="flex gap-1">
            <div className="h-5 w-5 rounded-full bg-[#C5C9D3]" />
            <div className="h-5 w-5 rounded-full bg-[#C5C9D3]" />
            <div className="h-5 w-5 rounded-full bg-[#C5C9D3]" />
          </div>
        </div>

        {/* Credibility */}
        <div className="flex flex-1 items-center gap-3">
          <span className="text-sm font-medium text-[#0D1B3E]">Credibility</span>
          <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-white">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-[#2FE89F] transition-all duration-500"
              style={{ width: `${credibility}%` }}
            />
            {/* Slider indicator */}
            <div
              className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-[#2FE89F] shadow-md transition-all duration-500"
              style={{ left: `calc(${credibility}% - 10px)` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

