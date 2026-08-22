import Link from 'next/link';
import TravelerCard from './TravelerCard';
import BulletText from './BulletText';
import { experience, profile } from '@/lib/data';

export default function Experience() {
  return (
    <section id="route" className="mx-auto max-w-6xl px-6 py-20">
      <div className="tag-label mb-3">Routing Card</div>
      <h2 className="placard-heading text-3xl md:text-4xl">Experience</h2>

      <div className="mt-10 space-y-6">
        {experience.map((e) => (
          <TravelerCard key={`${e.company}-${e.start}`} stubLabel={e.start.split(' ')[1] ?? e.start}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div>
                <h3 className="text-xl font-semibold text-ink">{e.company}</h3>
                <p className="font-mono text-sm text-ink-dim">{e.title}</p>
                {e.engagementType && (
                  <p className="tag-label mt-1 text-alert">{e.engagementType}</p>
                )}
              </div>
              <p className="tag-label whitespace-nowrap">
                {e.start} – {e.end}
              </p>
            </div>

            <ul className="mt-4 space-y-2">
              {e.bullets.map((b, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-ink-dim">
                  <span className="mt-1.5 h-1 w-1 flex-none bg-teal" aria-hidden="true" />
                  <span>
                    <BulletText text={b} />
                  </span>
                </li>
              ))}
            </ul>
          </TravelerCard>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4 border border-line p-5">
        <p className="tag-label">Full record</p>
        <Link href="/resume" className="font-mono text-sm text-teal hover:text-amber">
          View ATS-formatted resume →
        </Link>
        <a href={profile.resumeHref} download className="font-mono text-sm text-teal hover:text-amber">
          Download PDF →
        </a>
      </div>
    </section>
  );
}
