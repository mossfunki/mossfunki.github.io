import Head from 'next/head';
import Link from 'next/link';
import BulletText from '@/components/BulletText';
import { credentials, experience, profile, techGroups } from '@/lib/data';

export default function Resume() {
  return (
    <>
      <Head>
        <title>{profile.name} — Resume</title>
        <meta name="description" content={`ATS-formatted resume for ${profile.name}, ${profile.headline}.`} />
      </Head>

      <div className="mx-auto max-w-3xl px-6 py-12 print:py-0">
        <div className="mb-8 flex items-center justify-between print:hidden">
          <Link href="/" className="tag-label hover:text-amber">
            ← Back
          </Link>
          <button
            onClick={() => window.print()}
            className="rounded-sm border border-line px-4 py-2 font-mono text-sm uppercase tracking-tag hover:border-amber hover:text-amber"
          >
            Print / Save as PDF
          </button>
        </div>

        <article>
          <header className="mb-8 border-b border-line pb-6">
            <h1 className="placard-heading text-3xl md:text-4xl">{profile.name}</h1>
            <p className="mt-1 text-lg text-ink-dim">{profile.headline}</p>
            <p className="mt-3 font-mono text-sm text-ink-dim">
              {profile.phone} · {profile.email} · {profile.linkedin} · {profile.site}
            </p>
          </header>

          <section className="mb-8" aria-labelledby="education-heading">
            <h2 id="education-heading" className="tag-label mb-3 text-teal">
              Education &amp; Credentials
            </h2>
            <p className="text-sm text-ink">
              {credentials.degree}, {credentials.school}
            </p>
            <p className="text-sm text-ink">
              {credentials.cert} — {credentials.certNote}
            </p>
          </section>

          <section className="mb-8" aria-labelledby="skills-heading">
            <h2 id="skills-heading" className="tag-label mb-3 text-teal">
              Core Skills
            </h2>
            <p className="mb-3 text-sm text-ink">
              Demand Forecasting, Inventory Analytics, Logistics Network Analysis, Supply Chain Modeling,
              Operations Analytics, Cost-Benefit Analysis, KPI Reporting, Process Automation.
            </p>
            <dl className="space-y-1.5 text-sm">
              {techGroups.map((g) => (
                <div key={g.tag} className="flex gap-2">
                  <dt className="flex-none font-semibold text-ink">{g.tag}:</dt>
                  <dd className="text-ink-dim">{g.items.join(', ')}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="experience-heading">
            <h2 id="experience-heading" className="tag-label mb-3 text-teal">
              Experience
            </h2>
            <div className="space-y-6">
              {experience.map((e) => (
                <div key={`${e.company}-${e.start}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="font-semibold text-ink">
                      {e.company} — {e.title}
                      {e.engagementType ? ` (${e.engagementType})` : ''}
                    </h3>
                    <p className="whitespace-nowrap font-mono text-xs text-ink-dim">
                      {e.start} – {e.end}
                    </p>
                  </div>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink-dim">
                    {e.bullets.map((b, i) => (
                      <li key={i}>
                        <BulletText text={b} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </article>
      </div>
    </>
  );
}
