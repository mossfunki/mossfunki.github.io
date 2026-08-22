import Head from 'next/head';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import TechStack from '@/components/TechStack';
import Projects from '@/components/Projects';
import Experience from '@/components/Experience';
import Footer from '@/components/Footer';
import { profile } from '@/lib/data';

export default function Home() {
  return (
    <>
      <Head>
        <title>{`${profile.name} — ${profile.headline}`}</title>
        <meta name="description" content={profile.subhead} />
      </Head>
      <Nav />
      <main>
        <Hero />
        <TechStack />
        <Projects />
        <Experience />
      </main>
      <Footer />
    </>
  );
}
