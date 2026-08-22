import TravelerCard from './TravelerCard';
import { projects } from '@/lib/data';

export default function Projects() {
  return (
    <section id="work-orders" className="mx-auto max-w-6xl px-6 py-20">
      <div className="tag-label mb-3">Work Orders</div>
      <h2 className="placard-heading text-3xl md:text-4xl">Supply Chain Analytics Case Studies</h2>

      <div className="mt-10 space-y-6">
        {projects.map((p) => (
          <TravelerCard key={p.code} stubLabel={p.code}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xl font-semibold text-ink">{p.name}</h3>
              <div className="flex gap-4 font-mono text-xs uppercase tracking-tag">
                <a href={p.githubHref} className="text-ink-dim hover:text-amber">
                  GitHub →
                </a>
                {p.demoHref && (
                  <a href={p.demoHref} className="text-ink-dim hover:text-amber">
                    Demo →
                  </a>
                )}
              </div>
            </div>

            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="tag-label mb-1.5">Problem</dt>
                <dd className="text-sm text-ink-dim">{p.problem}</dd>
              </div>
              <div>
                <dt className="tag-label mb-1.5">Approach</dt>
                <dd className="text-sm text-ink-dim">{p.solution}</dd>
              </div>
              <div>
                <dt className="tag-label mb-1.5">Stack</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {p.stack.map((t) => (
                    <span key={t} className="rounded-sm border border-line px-2 py-0.5 font-mono text-xs text-ink">
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="tag-label mb-1.5">Result</dt>
                <dd className="text-sm font-medium text-teal">{p.roi}</dd>
              </div>
            </dl>
          </TravelerCard>
        ))}
      </div>
    </section>
  );
}
