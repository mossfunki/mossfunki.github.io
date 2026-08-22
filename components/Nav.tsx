import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '#stack', label: 'Stack' },
  { href: '#work-orders', label: 'Work Orders' },
  { href: '#route', label: 'Route' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="placard-heading text-lg">
          B. LAB
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="tag-label hover:text-amber">
              {l.label}
            </a>
          ))}
          <Link href="/resume" className="tag-label hover:text-amber">
            Resume
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="tag-label rounded-sm border border-line px-3 py-1.5 hover:border-amber hover:text-amber md:hidden"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-nav" className="border-t border-line bg-bg px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="tag-label hover:text-amber">
                {l.label}
              </a>
            ))}
            <Link href="/resume" onClick={() => setOpen(false)} className="tag-label hover:text-amber">
              Resume
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
