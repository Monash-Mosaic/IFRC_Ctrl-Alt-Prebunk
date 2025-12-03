import Image from "next/image";

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
            <Image
              src="/images/logos/IFRC-Solferino.png"
              alt="IFRC Solferino Academy Logo"
              height={61.35}
              width={223.67}
              className="h-8 w-auto"
            />
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
          <Image
            src="/images/logos/Monash-MOSAIC.png"
            alt="Monash University MOSAIC Logo"
            height={302.82}
            width={72}
            className="h-8 w-auto"
          />
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

