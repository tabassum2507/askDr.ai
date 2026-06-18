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
  ClipboardList,
  ArrowRight,
} from 'lucide-react';
import {
  HomeRemediesIllustration,
  MentalHealthIllustration,
  ReportAssistanceIllustration,
  MedicinesIllustration,
  FemaleHealthIllustration,
  BasicHealthIllustration,
  DietIllustration,
  CancerHealthIllustration,
  DrugInteractionsIllustration,
  SymptomCheckerIllustration,
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
    slug: 'symptom-checker',
    title: 'Symptom Checker',
    description: 'Answer a few questions to understand your symptoms',
    Icon: ClipboardList,
    Illustration: SymptomCheckerIllustration,
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

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  useEffect(() => {
    track('Page View', { page: 'home' });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">

      {/* Background blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-64 -top-64 z-0 h-[52rem] w-[52rem] rounded-full bg-teal-500/[0.07] blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-40 z-0 h-96 w-96 rounded-full bg-emerald-400/[0.05] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── Nav ── */}
        <nav className="flex items-center justify-between py-6">
          <span className="font-heading text-xl font-semibold text-[#134E4A]">
            askDr<span className="text-teal-600">.ai</span>
          </span>
          <Link
            href="/chat?intent=basic-health"
            className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.97]"
          >
            Start a conversation
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>

        {/* ── Hero ── */}
        <section className="grid grid-cols-1 items-center gap-12 py-12 lg:grid-cols-[1fr_auto] lg:gap-20 lg:py-20">

          {/* Left — copy */}
          <div className="flex max-w-xl flex-col gap-7">

            {/* Eyebrow */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-700">Powered by verified medical sources</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-3xl font-semibold leading-[1.1] tracking-tight text-[#134E4A] sm:text-4xl lg:text-5xl">
              Health answers you can<br className="hidden sm:block" /> actually trust
            </h1>

            {/* Subtitle */}
            <p className="text-lg leading-relaxed text-slate-500">
              Ask about medicines, symptoms, nutrition, or mental health — every
              answer is grounded in openFDA and MedlinePlus data, with sources
              you can verify.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#categories"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow-md active:scale-[0.97]"
              >
                Explore health topics
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/chat?intent=basic-health"
                className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-6 py-3 text-sm font-medium text-teal-700 shadow-sm transition-all hover:border-teal-300 hover:shadow-md active:scale-[0.97]"
              >
                Ask anything
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Mini stats */}
            <p className="text-sm text-slate-400">
              8+ medicine databases&nbsp;&middot;&nbsp;7 health categories&nbsp;&middot;&nbsp;Evidence-based answers
            </p>
          </div>

          {/* Right — mock chat card, desktop only */}
          <div className="hidden lg:block">
            <div className="w-[22rem] rotate-1 rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-100/80">

              {/* Card header */}
              <div className="mb-4 flex items-center gap-2 border-b border-slate-50 pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600">
                  <Activity className="h-3.5 w-3.5 text-white" strokeWidth={2.25} />
                </div>
                <span className="text-sm font-semibold text-slate-700">askDr.ai</span>
                <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-green-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Online
                </span>
              </div>

              {/* User bubble */}
              <div className="mb-3 flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-slate-800 px-3.5 py-2.5 text-xs leading-relaxed text-white">
                  What are the side effects of ibuprofen?
                </div>
              </div>

              {/* Assistant bubble */}
              <div className="mb-3 flex justify-start">
                <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-xs leading-relaxed text-slate-700">
                  Common side effects include{' '}
                  <span className="font-semibold text-slate-800">stomach pain, nausea, and dizziness</span>
                  . According to the FDA drug label, serious side effects may include kidney problems and...
                </div>
              </div>

              {/* Sources tag */}
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-600 ring-1 ring-teal-100">
                  Sources (3)
                </span>
                <span className="text-[10px] text-slate-300">Just now</span>
              </div>
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

            <div className="flex flex-col gap-1 text-xs text-slate-400 sm:items-end">
              <span>
                For informational purposes only. Not medical advice.{' '}
                <span className="font-medium text-slate-500">
                  Always consult a healthcare professional.
                </span>
              </span>
              <span className="text-[11px] text-slate-400">
                Built by{' '}
                <a
                  href="https://www.linkedin.com/in/tabassum-khanum/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 transition hover:text-teal-700 hover:underline"
                >
                  Tabassum Khanum
                </a>
                {' · '}
                <a
                  href="https://github.com/tabassumkhanum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 transition hover:text-teal-700 hover:underline"
                >
                  GitHub
                </a>
              </span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
