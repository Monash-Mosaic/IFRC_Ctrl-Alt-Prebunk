import Image from 'next/image';
import type { ReactNode } from 'react';

type ChatHeadlineProps = {
  name: string;
  avatar?: ReactNode;
};

export default function ChatHeadline({ name, avatar }: ChatHeadlineProps) {
  return (
    //ml-20 to offset the left nav bar
    <div className="hidden md:block px-4 ml-20">
      <div className="flex items-center gap-3 mb-2">
        {avatar ?? <Image src="/images/chat-avatar-icon.png" alt={name} width={32} height={32} />}
        <h2 className="font-bold text-black text-lg">{name}</h2>
      </div>
      <div className="border-t border-black" />
    </div>
  );
}
