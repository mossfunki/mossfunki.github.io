import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    window.localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <button
      onClick={toggle}
      className="tag-label flex items-center gap-2 rounded-sm border border-line px-3 py-1.5 transition-colors hover:border-amber hover:text-amber"
      aria-pressed={dark}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" aria-hidden="true" />
      {dark ? 'Night Ops' : 'Day Ops'}
    </button>
  );
}
