import { useEffect, useState } from 'react';

const DIGIT_POOL = '0123456789';
const LETTER_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function poolFor(char: string) {
  if (/[0-9]/.test(char)) return DIGIT_POOL;
  if (/[A-Za-z]/.test(char)) return LETTER_POOL;
  return char;
}

type Props = {
  value: string;
  className?: string;
  charClassName?: string;
  delayMs?: number;
};

/**
 * Airport-departures-board style character flip. Signature motif for the
 * hero headline and stat metrics — settles left-to-right like a Solari board.
 */
export default function SplitFlap({ value, className = '', charClassName = '', delayMs = 0 }: Props) {
  const chars = value.split('');
  const [display, setDisplay] = useState<string[]>(chars);
  const [cycling, setCycling] = useState(false);

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setDisplay(chars);
      return;
    }

    const totalTicks = 12;
    let tick = 0;
    let interval: number | undefined;
    setCycling(true);

    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        tick += 1;
        setDisplay(
          chars.map((c, i) => {
            const settleAt = Math.ceil(((i + 1) / chars.length) * totalTicks);
            if (tick >= settleAt) return c;
            const pool = poolFor(c);
            return pool[Math.floor(Math.random() * pool.length)];
          })
        );
        if (tick >= totalTicks) {
          if (interval) window.clearInterval(interval);
          setCycling(false);
        }
      }, 55);
    }, delayMs);

    return () => {
      window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delayMs]);

  return (
    <span className={`relative inline-flex ${className}`}>
      <span className="sr-only">{value}</span>
      <span className="flap-row" aria-hidden="true">
        {display.map((c, i) => (
          <span key={i} className={`flap-char ${cycling ? 'is-cycling' : ''} ${charClassName}`}>
            {c}
          </span>
        ))}
      </span>
    </span>
  );
}
