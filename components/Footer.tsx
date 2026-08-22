import { FormEvent, useState } from 'react';
import { profile } from '@/lib/data';

const FORM_ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT;

export default function Footer() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!FORM_ENDPOINT) {
      const subject = encodeURIComponent(`Portfolio contact from ${name || 'a recruiter'}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      setStatus('sent');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <div className="tag-label mb-3">Dispatch</div>
          <h2 className="placard-heading text-3xl md:text-4xl">Get In Touch</h2>
          <p className="mt-4 max-w-sm text-sm text-ink-dim">
            Open to mid-level supply chain data analyst and business intelligence engineer roles.
            Reach out directly or send a note below.
          </p>
          <ul className="mt-6 space-y-2 font-mono text-sm">
            <li>
              <a href={`mailto:${profile.email}`} className="text-teal hover:text-amber">
                {profile.email}
              </a>
            </li>
            <li>
              <a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="text-teal hover:text-amber">
                {profile.phone}
              </a>
            </li>
            <li>
              <a href={profile.linkedinUrl} className="text-teal hover:text-amber">
                {profile.linkedin}
              </a>
            </li>
            <li className="text-ink-dim">{profile.site}</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="tag-label mb-1.5 block">
              Name
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-line bg-panel px-3 py-2 text-sm text-ink outline-none focus-visible:border-amber"
            />
          </div>
          <div>
            <label htmlFor="email" className="tag-label mb-1.5 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line bg-panel px-3 py-2 text-sm text-ink outline-none focus-visible:border-amber"
            />
          </div>
          <div>
            <label htmlFor="message" className="tag-label mb-1.5 block">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-line bg-panel px-3 py-2 text-sm text-ink outline-none focus-visible:border-amber"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="rounded-sm bg-amber px-6 py-2.5 font-mono text-sm font-semibold uppercase tracking-tag text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
          {status === 'sent' && <p className="text-sm text-teal">Message ready — check your mail client.</p>}
          {status === 'error' && <p className="text-sm text-alert">Something went wrong — email me directly instead.</p>}
        </form>
      </div>

      <div className="border-t border-line px-6 py-6 text-center font-mono text-xs uppercase tracking-tag text-ink-dim">
        © {new Date().getFullYear()} {profile.name} — Built with Next.js & Tailwind CSS
      </div>
    </footer>
  );
}
