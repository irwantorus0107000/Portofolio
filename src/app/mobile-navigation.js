'use client';

import { useState } from 'react';

export default function MobileNavigation({ links }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label={open ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        className="flex h-11 w-11 items-center justify-center border border-white/20 text-white hover:border-[#00A3FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00A3FF]"
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden="true" className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
      </button>
      <nav
        id="mobile-navigation"
        aria-label="Navigasi seluler"
        hidden={!open}
        className="absolute left-0 right-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-white/10 bg-[#030305] p-4 shadow-xl"
      >
        {links.map(({ href, label }) => (
          <a key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-white/5 px-3 py-3 font-mono text-sm font-semibold tracking-wider text-neutral-300 hover:text-[#00A3FF]">
            {label}
          </a>
        ))}
      </nav>
    </div>
  );
}
