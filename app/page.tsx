'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics';
import {
  Activity,
  Leaf,
  Brain,
  FileText,
  Pill,
  Heart,
  Stethoscope,
  Apple,
  Ribbon,
  ShieldAlert,
  Check,
  ArrowRight,
} from 'lucide-react';
import {
  HeroIllustration,
  HomeRemediesIllustration,
  MentalHealthIllustration,
  ReportAssistanceIllustration,
  MedicinesIllustration,
  FemaleHealthIllustration,
  BasicHealthIllustration,
  DietIllustration,
  CancerHealthIllustration,
  DrugInteractionsIllustration,
} from '@/components/illustrations';

// ─── category data ───────────────────────────────────────────────────────────

const categories = [
  {
    slug: 'home-remedies',
    title: 'Home Remedies',
    description: 'Natural solutions for common everyday issues',
    Icon: Leaf,
    Illustration: HomeRemediesIllustration,
    feature: false,
    centered: false,
  },
  {
    slug: 'mental-health',
    title: 'Mental Health',
    description: 'Support for emotional and psychological wellbeing',
    Icon: Brain,
    Illustration: MentalHealthIllustration,
    feature: false,
    centered: false,
  },
  {
    slug: 'report-assistance',
    title: 'Report Assistance',
    description: 'Understand medical reports and lab results clearly',
    Icon: FileText,
    Illustration: ReportAssistanceIllustration,
    feature: true,
    centered: false,
  },
  {
    slug: 'medicines',
    title: 'Medicines',
    description: 'Dosage, interactions, and side effect information',
    Icon: Pill,
    Illustration: MedicinesIllustration,
    feature: true,
    centered: false,
  },
  {
    slug: 'female-health',
    title: 'Female Health',
    description: "Women's health, hormones, and reproductive info",
    Icon: Heart,
    Illustration: FemaleHealthIllustration,
    feature: false,
    centered: false,
  },
  {
    slug: 'basic-health',
    title: 'Basic Health',
    description: 'General wellness and everyday health questions',
    Icon: Stethoscope,
    Illustration: BasicHealthIllustration,
    feature: false,
    centered: false,
  },
  {
    slug: 'diet',
    title: 'Diet & Nutrition',
    description: 'Guidance on food choices and healthy eating habits',
    Icon: Apple,
    Illustration: DietIllustration,
    feature: false,
    centered: false,
  },
  {
    slug: 'drug-interactions',
    title: 'Drug Interactions',
    description: 'Check if your medicines interact with each other',
    Icon: ShieldAlert,
    Illustration: DrugInteractionsIllustration,
    feature: false,
    centered: false,
  },
  {
    slug: 'cancer-health',
    title: 'Cancer Health',
    description: 'Cancer types, treatments, screening, and support resources',
    Icon: Ribbon,
    Illustration: CancerHealthIllustration,
    feature: false,
    centered: true,
  },
] as const;

const TRUST_ITEMS = ['openFDA drug labels', 'MedlinePlus guidelines', 'Evidence-based answers'];

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  useEffect(() => {
    track('Page View', { page: 'home' });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F0FDFA]">

      {/* Grain texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '300px 300px',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-48 -top-48 z-0 h-[40rem] w-[40rem] rounded-full bg-teal-200/30 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-36 top-1/4 z-0 h-[32rem] w-[32rem] rounded-full bg-emerald-200/25 blur-[96px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/3 z-0 h-80 w-80 rounded-full bg-teal-100/50 blur-[80px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── Logo bar ── */}
        <nav className="flex items-center justify-between pb-4 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 shadow-sm">
              <Activity className="h-4.5 w-4.5 text-white" strokeWidth={2.25} />
            </div>
            <span className="font-heading text-xl font-semibold text-[#134E4A]">
              askDr<span className="text-teal-600">.ai</span>
            </span>
          </div>
          <Link
            href="/chat?intent=basic-health"
            className="rounded-xl border border-teal-200 bg-white/70 px-4 py-2 text-sm font-medium text-teal-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-teal-300 hover:bg-white hover:shadow-md"
          >
            Open chat
          </Link>
        </nav>

        {/* ── Hero ── */}
        <section className="grid grid-cols-1 items-center gap-10 py-12 lg:grid-cols-2 lg:gap-20 lg:py-20">

          {/* Left — copy */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-teal-200/80 bg-white/60 px-3 py-1 text-xs font-medium text-teal-700 shadow-sm backdrop-blur-sm">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-600">
                <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
              </span>
              Grounded in openFDA &amp; MedlinePlus
            </div>

            <h1 className="font-heading text-4xl font-semibold leading-[1.12] tracking-tight text-[#134E4A] sm:text-5xl lg:text-[3.5rem]">
              Your AI health<br />
              <em className="not-italic text-teal-600">companion</em>
            </h1>

            <p className="max-w-md text-base leading-relaxed text-slate-500 sm:text-lg">
              Trusted answers, grounded in real medical sources —{' '}
              <span className="font-medium text-slate-600">not guesswork.</span>
            </p>

            {/* Trust strip */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {TRUST_ITEMS.map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Check className="h-3.5 w-3.5 shrink-0 text-teal-500" strokeWidth={2.5} />
                  {item}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#categories"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-semibold text-teal-900 shadow-sm transition-all duration-200 hover:bg-amber-500 hover:shadow-md active:scale-[0.97]"
              >
                Explore topics
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/chat?intent=basic-health"
                className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white/70 px-6 py-3 text-sm font-medium text-teal-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-teal-300 hover:bg-white hover:shadow-md active:scale-[0.97]"
              >
                Ask anything
              </Link>
            </div>
          </div>

          {/* Right — hero illustration */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative flex h-72 w-72 items-center justify-center overflow-hidden rounded-3xl bg-white/50 shadow-xl ring-1 ring-teal-100 sm:h-80 sm:w-80 lg:h-[26rem] lg:w-[26rem]">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-transparent to-emerald-50/60" />
              <HeroIllustration className="relative h-full w-full p-8" />
            </div>
          </div>
        </section>

        {/* ── Category bento ── */}
        <section id="categories" className="pb-24 pt-4">
          <div className="mb-8">
            <h2 className="font-heading text-2xl font-semibold text-[#134E4A] sm:text-3xl">
              Explore health topics
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Choose a category to begin a focused conversation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {categories.map(({ slug, title, description, Icon, Illustration, feature, centered }) => {
              const colClass = feature
                ? 'col-span-1 sm:col-span-2'
                : centered
                ? 'col-span-2 sm:col-span-1 lg:col-span-2 lg:col-start-2'
                : 'col-span-1';

              return (
                <Link
                  key={slug}
                  href={`/chat?intent=${slug}`}
                  onClick={() => track('Category Selected', { category: slug })}
                  className={[
                    'group relative flex flex-col overflow-hidden rounded-2xl border border-teal-100 bg-white p-5',
                    'shadow-[0_1px_4px_rgba(13,148,136,0.06),0_4px_16px_rgba(13,148,136,0.04)]',
                    'transition-all duration-300 hover:-translate-y-1',
                    'hover:border-teal-200 hover:shadow-[0_4px_12px_rgba(13,148,136,0.10),0_12px_40px_rgba(13,148,136,0.08)]',
                    colClass,
                  ].join(' ')}
                >
                  {/* Illustration area */}
                  <div
                    className={[
                      'relative mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-[#CCFBF1]/50',
                      feature ? 'h-36' : 'h-24',
                    ].join(' ')}
                  >
                    <Illustration
                      className={[
                        'transition-transform duration-500 group-hover:scale-[1.06]',
                        feature ? 'h-32 w-full' : 'h-20 w-full',
                      ].join(' ')}
                    />
                  </div>

                  {/* Icon chip */}
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 ring-1 ring-teal-100">
                    <Icon className="h-4 w-4 text-teal-600" strokeWidth={1.75} />
                  </div>

                  {/* Copy */}
                  <p
                    className={[
                      'font-heading font-semibold text-[#134E4A]',
                      feature ? 'text-xl' : 'text-base',
                    ].join(' ')}
                  >
                    {title}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-slate-400 sm:text-sm">
                    {description}
                  </p>

                  {/* Hover arrow */}
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-teal-600">
                    Start
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-teal-100/80 py-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600">
                <Activity className="h-3.5 w-3.5 text-white" strokeWidth={2.25} />
              </div>
              <span className="font-heading text-sm font-semibold text-[#134E4A]">
                askDr<span className="text-teal-600">.ai</span>
              </span>
            </div>

            <div className="flex flex-col gap-0.5 text-xs text-slate-400 sm:items-end">
              <span>
                For informational purposes only. Not medical advice.{' '}
                <span className="font-medium text-slate-500">
                  Always consult a healthcare professional.
                </span>
              </span>
              <span className="text-slate-400">Built with openFDA + MedlinePlus data</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
