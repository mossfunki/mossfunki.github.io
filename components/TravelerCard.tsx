import { ReactNode } from 'react';

type Props = {
  stubLabel: string;
  children: ReactNode;
  className?: string;
};

/**
 * Shop-traveler card — the routing document that follows a part through
 * production stations, reused here as the card shell for work-order
 * projects and timeline entries.
 */
export default function TravelerCard({ stubLabel, children, className = '' }: Props) {
  return (
    <div className={`traveler-card animate-settle ${className}`}>
      <span className="reg-mark tl" aria-hidden="true" />
      <span className="reg-mark br" aria-hidden="true" />
      <div className="traveler-stub">{stubLabel}</div>
      <div className="traveler-body">{children}</div>
    </div>
  );
}
