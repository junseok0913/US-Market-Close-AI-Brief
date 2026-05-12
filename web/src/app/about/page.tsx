import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Newspaper,
  Users,
  FileText,
  Headphones,
  ArrowRight,
  Mail,
  Phone,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'JSKcorp — US Market Close AI Brief',
  description:
    'JSKcorp builds US Market Close AI Brief: an AI pipeline that turns each US trading day into a short, listenable market briefing.',
};

const steps = [
  {
    icon: Newspaper,
    title: 'Continuous news ingestion',
    body: 'A scheduled cloud pipeline crawls US market news around the clock and stores it in a structured, queryable form.',
  },
  {
    icon: Users,
    title: 'Multi-agent analysis & debate',
    body: 'Specialized AI agents extract the day’s themes, and for each requested ticker a panel of expert personas debates the evidence to reach a reasoned view.',
  },
  {
    icon: FileText,
    title: 'Briefing script generation',
    body: 'The analysis is composed into a coherent, conversational script — opening, market themes, company deep-dives, and a wrap-up.',
  },
  {
    icon: Headphones,
    title: 'Natural-voice audio & web player',
    body: 'The script is rendered to natural-sounding speech and published to a web player you can listen to on your morning commute.',
  },
];

const features = [
  {
    title: 'Built for your portfolio',
    body: 'Tell us which tickers you care about and the brief includes a dedicated deep-dive on each one.',
  },
  {
    title: 'Evidence-grounded',
    body: 'Every claim is traced back to source news, price action, and SEC filings — not vibes.',
  },
  {
    title: 'Short by design',
    body: 'A full trading day, distilled into a few minutes you can actually fit into a morning routine.',
  },
  {
    title: 'Listen anywhere',
    body: 'Audio plus a synced transcript and charts in a lightweight web player — no app required.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Hero with stock-market background */}
      <header className="relative isolate overflow-hidden text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-trading.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/65 to-black/30" />

        {/* Nav */}
        <nav className="flex items-center justify-between px-6 md:px-10 py-5">
          <Link href="/about" className="font-title italic text-[22px] tracking-[-1px] text-white">
            JSKcorp
          </Link>
          <div className="flex items-center gap-6 text-[15px] font-medium text-white/90">
            <a href="#how-it-works" className="hover:text-white hover:underline">How it works</a>
            <a href="#contact" className="hover:text-white hover:underline">Contact</a>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/50 px-4 py-1.5 hover:bg-white hover:text-black transition-colors"
            >
              Listen <ArrowRight size={16} />
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="px-6 md:px-10 pt-16 md:pt-28 pb-20 md:pb-32 max-w-[1100px]">
          <p className="text-[14px] tracking-[2px] uppercase text-white/60 mb-5">
            JSKcorp
          </p>
          <h1 className="font-title italic text-[44px] md:text-[72px] leading-[1.05] tracking-[-2px]">
            US Market Close AI Brief
          </h1>
          <p className="mt-6 text-[18px] md:text-[22px] font-extralight tracking-[-0.5px] text-white/80 max-w-[680px]">
            Every morning, our AI analyzes the previous US trading session — the major
            moves, the themes driving them, and the companies you follow — and delivers
            it as a short podcast you can listen to before the day starts.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-[16px] font-medium hover:opacity-90 transition-opacity"
            >
              Listen to the latest brief <ArrowRight size={18} />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-[16px] font-medium hover:bg-white/10 transition-colors"
            >
              Contact us
            </a>
          </div>
        </div>
      </header>

      {/* What we do */}
      <section className="px-6 md:px-10 py-14 md:py-20 max-w-[860px]">
        <h2 className="font-title italic text-[28px] md:text-[36px] tracking-[-1px] mb-5">
          What we do
        </h2>
        <p className="text-[17px] md:text-[19px] leading-relaxed text-text-secondary">
          JSKcorp is a small software company building tools that make financial
          information easier to keep up with. Our first product, <span className="text-text-primary font-medium">US Market Close AI Brief</span>,
          replaces the scramble of reading a dozen market recaps with a single,
          well-structured audio briefing — generated end to end by an AI pipeline,
          grounded in real news, price data, and regulatory filings, and tailored to the
          tickers each listener actually cares about.
        </p>
      </section>

      <div className="mx-6 md:mx-10 border-t border-border-default" />

      {/* How it works */}
      <section id="how-it-works" className="px-6 md:px-10 py-14 md:py-20">
        <h2 className="font-title italic text-[28px] md:text-[36px] tracking-[-1px] mb-10">
          How it works
        </h2>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border-default border border-border-default rounded-2xl overflow-hidden">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="bg-bg-card p-7 md:p-9">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-default">
                    <Icon size={18} />
                  </span>
                  <span className="text-[14px] text-text-muted font-medium">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="text-[20px] md:text-[22px] font-medium mb-2">{step.title}</h3>
                <p className="text-[16px] leading-relaxed text-text-secondary">{step.body}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mx-6 md:mx-10 border-t border-border-default" />

      {/* Features */}
      <section className="px-6 md:px-10 py-14 md:py-20">
        <h2 className="font-title italic text-[28px] md:text-[36px] tracking-[-1px] mb-10">
          Why listeners use it
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border-default bg-bg-card p-6">
              <h3 className="text-[18px] font-medium mb-2">{f.title}</h3>
              <p className="text-[15px] leading-relaxed text-text-secondary">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-6 md:mx-10 border-t border-border-default" />

      {/* Contact */}
      <section id="contact" className="px-6 md:px-10 py-14 md:py-20 max-w-[860px]">
        <h2 className="font-title italic text-[28px] md:text-[36px] tracking-[-1px] mb-5">
          Contact
        </h2>
        <p className="text-[17px] md:text-[19px] leading-relaxed text-text-secondary mb-8">
          Questions, partnership ideas, or feedback? We&apos;d love to hear from you.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="mailto:junseok0913@kakao.com"
            className="inline-flex items-center gap-3 text-[17px] font-medium hover:underline w-fit"
          >
            <Mail size={20} /> junseok0913@kakao.com
          </a>
          <a
            href="tel:+821023100581"
            className="inline-flex items-center gap-3 text-[17px] font-medium hover:underline w-fit"
          >
            <Phone size={20} /> +82 10-2310-0581
          </a>
        </div>
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-text-primary text-bg-primary px-6 py-3 text-[16px] font-medium hover:opacity-90 transition-opacity"
          >
            Try the demo <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-10 border-t border-border-default flex flex-col md:flex-row gap-2 md:items-center md:justify-between text-[14px] text-text-muted">
        <span>&copy; {new Date().getFullYear()} JSKcorp. All rights reserved.</span>
        <span>US Market Close AI Brief — Seoul, Republic of Korea</span>
      </footer>
    </div>
  );
}
