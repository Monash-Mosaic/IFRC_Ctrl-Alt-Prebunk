'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import Modal from 'react-modal';

const photoCredits = [
  {
    title: 'flooding',
    image: '/images/posts/ifrc/question-02.webp',
    source: 'IFRC',
    author: 'Fernando Gandarillas',
    href: 'https://www.ifrc.org/article/el-nino-what-it-and-what-does-it-mean-disasters',
  },
  {
    title: 'Debate podiums',
    image: '/images/posts/ifrc/question-03.webp',
    source: 'Wikimedia Commons',
    author: 'Kefr4000',
    href: 'https://commons.wikimedia.org/wiki/File:Official_podiums_at_Marienborg_2.jpg',
    edited: true,
  },
  {
    title: '70% sign',
    image: '/images/posts/ifrc/question-05.webp',
    source: 'PxHere',
    href: 'https://pxhere.com/en/photo/1187264',
    edited: true,
  },
  {
    title: 'Glacier calving',
    image: '/images/posts/ifrc/question-07.webp',
    source: 'Pixabay',
    author: 'Schmid-Reportagen',
    href: 'https://pixabay.com/photos/alaska-glacier-ice-cream-calve-566722/',
  },
  {
    title: 'Drought',
    image: '/images/posts/ifrc/question-08.webp',
    source: 'Alabama Extension',
    author: 'Bruce Dupree',
    href: 'https://www.flickr.com/photos/alabama_extension/48832143091/',
  },
  {
    title: 'Red warning light',
    image: '/images/posts/ifrc/question-04.webp',
    source: 'ISO Republic',
    author: 'ISO Legacy',
    href: 'https://isorepublic.com/photo/red-light/',
    edited: true,
  },
  {
    title: 'Winter landscape',
    image: '/images/example/echo-post-img.jpg',
    source: 'Unsplash',
    author: 'Joakim Nådell',
    href: 'https://unsplash.com/photos/photo-of-green-trees-3I9QlTia9Qo',
  },
];

export default function PhotoCreditsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Photo credits"
      overlayClassName="fixed inset-0 z-[100] flex items-center justify-center bg-[#011E41]/40 p-3"
      className="flex max-h-[min(42rem,calc(100dvh-1.5rem))] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white text-[#011E41] shadow-2xl outline-none"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
        <h2 className="text-xl font-semibold">Photo credits</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo credits"
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      <ul className="min-h-0 divide-y divide-slate-200 overflow-y-auto overscroll-contain px-5">
        {photoCredits.map(({ title, image, source, author, href, edited }) => (
          <li key={title} className="flex items-center gap-3 py-3">
            <Image src={image} alt="" width={64} height={44} className="h-11 w-16 shrink-0 rounded-md object-cover" />
            <div className="min-w-0 text-sm">
              <p className="font-semibold">{title}</p>
              <p className="text-xs leading-relaxed text-slate-700">
                Photo:{' '}
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 hover:text-[#011E41]"
                >
                  {source}
                </a>
                {author && ` / ${author}`}
                {edited && ' · Edited'}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <footer className="shrink-0 border-t border-slate-200 px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 w-full cursor-pointer rounded-lg bg-[#011E41] px-4 text-sm font-medium text-white hover:bg-[#002552] focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Close
        </button>
      </footer>
    </Modal>
  );
}
