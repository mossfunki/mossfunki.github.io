import { techGroups } from '@/lib/data';

export default function TechStack() {
  return (
    <section id="stack" className="mx-auto max-w-6xl px-6 py-20">
      <div className="tag-label mb-3">Bill of Materials</div>
      <h2 className="placard-heading text-3xl md:text-4xl">Technical Stack</h2>

      <div className="mt-10 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
        {techGroups.map((group) => (
          <div key={group.tag} className="bg-bg p-6">
            <h3 className="font-mono text-sm font-semibold uppercase tracking-tag text-teal">{group.tag}</h3>
            <ul className="mt-4 space-y-2">
              {group.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-ink">
                  <span className="h-1 w-1 flex-none bg-ink-dim" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
