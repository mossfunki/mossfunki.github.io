import SplitFlap from './SplitFlap';
import { metrics, profile } from '@/lib/data';

export default function Hero() {
  return (
    <section id="top" className="mx-auto max-w-6xl px-6 pb-20 pt-14 md:pt-24">
      <div className="tag-label mb-6 flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" aria-hidden="true" />
        Operations Log — {profile.name}
      </div>

      <h1 className="placard-heading max-w-4xl text-5xl md:text-7xl">{profile.headline}</h1>

      <p className="mt-6 max-w-2xl text-lg text-ink-dim md:text-xl">{profile.subhead}</p>

      <div className="mt-9 flex flex-wrap gap-4">
        <a
          href="#work-orders"
          className="rounded-sm bg-amber px-6 py-3 font-mono text-sm font-semibold uppercase tracking-tag text-bg transition-opacity hover:opacity-90"
        >
          View Case Studies
        </a>
        <a
          href={profile.resumeHref}
          download
          className="rounded-sm border border-line px-6 py-3 font-mono text-sm font-semibold uppercase tracking-tag text-ink transition-colors hover:border-amber hover:text-amber"
        >
          Download Resume
        </a>
      </div>

      <dl className="mt-16 grid grid-cols-1 divide-y divide-line border border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {metrics.map((m, i) => (
          <div key={m.label} className="p-6">
            <dt className="tag-label mb-3">{m.label}</dt>
            <dd>
              <SplitFlap
                value={`${m.value}${m.suffix}`}
                delayMs={i * 180}
                className="text-3xl md:text-4xl"
                charClassName="h-11 w-8 md:h-12 md:w-9 leading-[2.75rem] md:leading-[3rem] text-teal"
              />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
