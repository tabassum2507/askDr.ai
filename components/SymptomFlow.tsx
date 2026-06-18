'use client';

import { useState } from 'react';
import {
  Brain, Heart, Activity, AlignJustify, Grip,
  ArrowDown, Layers, Thermometer,
  ChevronLeft, AlertTriangle,
} from 'lucide-react';
import { track } from '@/lib/analytics';

const BODY_AREAS = [
  { label: 'Head & Face',          Icon: Brain,         iconClass: 'text-purple-500', accent: 'hover:border-purple-300 hover:bg-purple-50' },
  { label: 'Chest & Lungs',        Icon: Heart,         iconClass: 'text-red-500',    accent: 'hover:border-red-300 hover:bg-red-50'    },
  { label: 'Stomach & Digestion',  Icon: Activity,      iconClass: 'text-orange-500', accent: 'hover:border-orange-300 hover:bg-orange-50' },
  { label: 'Back & Spine',         Icon: AlignJustify,  iconClass: 'text-amber-500',  accent: 'hover:border-amber-300 hover:bg-amber-50' },
  { label: 'Arms & Hands',         Icon: Grip,          iconClass: 'text-teal-500',   accent: 'hover:border-teal-300 hover:bg-teal-50'  },
  { label: 'Legs & Feet',          Icon: ArrowDown,     iconClass: 'text-blue-500',   accent: 'hover:border-blue-300 hover:bg-blue-50'  },
  { label: 'Skin',                 Icon: Layers,        iconClass: 'text-green-500',  accent: 'hover:border-green-300 hover:bg-green-50' },
  { label: 'General / Full Body',  Icon: Thermometer,   iconClass: 'text-rose-500',   accent: 'hover:border-rose-300 hover:bg-rose-50'  },
] as const;

const SYMPTOMS_BY_AREA: Record<string, string[]> = {
  'Head & Face':         ['Headache', 'Dizziness', 'Blurred vision', 'Ear pain', 'Sore throat', 'Congestion', 'Facial pain'],
  'Chest & Lungs':       ['Chest pain', 'Shortness of breath', 'Cough', 'Palpitations', 'Wheezing', 'Chest tightness'],
  'Stomach & Digestion': ['Nausea', 'Vomiting', 'Diarrhea', 'Bloating', 'Loss of appetite', 'Abdominal pain', 'Heartburn', 'Constipation'],
  'Back & Spine':        ['Lower back pain', 'Upper back pain', 'Stiffness', 'Numbness', 'Radiating pain', 'Muscle spasm'],
  'Arms & Hands':        ['Joint pain', 'Swelling', 'Numbness', 'Weakness', 'Rash', 'Tremor', 'Tingling'],
  'Legs & Feet':         ['Joint pain', 'Swelling', 'Numbness', 'Leg cramps', 'Weakness', 'Tingling'],
  'Skin':                ['Rash', 'Itching', 'Redness', 'Swelling', 'Dryness', 'Blisters', 'Discoloration', 'Peeling'],
  'General / Full Body': ['Fever', 'Fatigue', 'Weight loss', 'Night sweats', 'Body aches', 'Chills', 'Loss of appetite', 'Weakness'],
};

const DURATION_OPTIONS = [
  'Just started (today)',
  'A few days (2–5 days)',
  'About a week',
  'More than 2 weeks',
  'More than a month',
];

const SEVERITY_OPTIONS = [
  { label: 'Mild',     description: 'Uncomfortable but manageable', ring: 'border-green-300 bg-green-50 text-green-700',  idle: 'hover:border-green-200 hover:bg-green-50/50' },
  { label: 'Moderate', description: 'Affecting daily activities',   ring: 'border-amber-300 bg-amber-50 text-amber-700',  idle: 'hover:border-amber-200 hover:bg-amber-50/50' },
  { label: 'Severe',   description: 'Very difficult to manage',     ring: 'border-red-300 bg-red-50 text-red-700',        idle: 'hover:border-red-200 hover:bg-red-50/50'   },
] as const;

const EMERGENCY_SYMPTOMS = new Set(['Chest pain', 'Shortness of breath', 'Palpitations', 'Wheezing', 'Chest tightness']);

interface SymptomFlowProps {
  onComplete: (query: string) => void;
  loading: boolean;
}

export default function SymptomFlow({ onComplete, loading }: SymptomFlowProps) {
  const [step, setStep]               = useState(1);
  const [bodyArea, setBodyArea]       = useState('');
  const [symptoms, setSymptoms]       = useState<string[]>([]);
  const [otherSymptom, setOtherSymptom] = useState('');
  const [duration, setDuration]       = useState('');
  const [severity, setSeverity]       = useState('');
  const [extraInfo, setExtraInfo]     = useState('');

  const TOTAL_STEPS = 5;
  const allSymptoms = [...symptoms, ...(otherSymptom.trim() ? [otherSymptom.trim()] : [])];

  const showEmergencyBanner =
    bodyArea === 'Chest & Lungs' && symptoms.some((s) => EMERGENCY_SYMPTOMS.has(s));

  function selectBodyArea(area: string) {
    setBodyArea(area);
    setSymptoms([]);
    setOtherSymptom('');
    track('Symptom Flow Started', { body_area: area });
    setStep(2);
  }

  function toggleSymptom(s: string) {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function handleGetGuidance() {
    track('Symptom Flow Completed', {
      body_area: bodyArea,
      symptom_count: allSymptoms.length,
      duration,
      severity,
    });
    const query = [
      `I have ${allSymptoms.join(', ')} in my ${bodyArea}`,
      `for ${duration.toLowerCase()}.`,
      `Severity is ${severity.toLowerCase()}.`,
      extraInfo.trim() ? `Additional context: ${extraInfo.trim()}` : '',
    ]
      .filter(Boolean)
      .join(' ');
    onComplete(query);
  }

  const backBtn = (
    <button
      type="button"
      onClick={() => setStep((s) => s - 1)}
      className="flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-600"
    >
      <ChevronLeft className="h-4 w-4" />
      Back
    </button>
  );

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Progress bar */}
      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Step {step} of {TOTAL_STEPS}</span>
          <span className="text-[11px] text-slate-400">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-1.5 rounded-full bg-teal-500 transition-all duration-300 ease-out"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Emergency banner */}
      {showEmergencyBanner && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p className="text-xs font-medium leading-relaxed text-red-700">
            If you have chest pain or difficulty breathing, this may be a medical emergency.
            Please call <strong>911</strong> or go to the nearest emergency room immediately.
          </p>
        </div>
      )}

      {/* ── Step 1: Body area ──────────────────────────────── */}
      {step === 1 && (
        <>
          <p className="mb-4 text-sm font-semibold text-slate-700">Where is the problem?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BODY_AREAS.map(({ label, Icon, iconClass, accent }) => (
              <button
                key={label}
                type="button"
                onClick={() => selectBodyArea(label)}
                className={`flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-3 text-center transition hover:shadow-sm ${accent}`}
              >
                <Icon className={`h-5 w-5 ${iconClass}`} strokeWidth={1.75} />
                <span className="text-[11px] font-medium leading-tight text-slate-700">{label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Step 2: Symptoms ──────────────────────────────── */}
      {step === 2 && (
        <>
          <p className="mb-0.5 text-sm font-semibold text-slate-700">What are you experiencing?</p>
          <p className="mb-3 text-xs text-slate-400">Select all that apply — {bodyArea}</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {(SYMPTOMS_BY_AREA[bodyArea] ?? []).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSymptom(s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  symptoms.includes(s)
                    ? 'border-teal-400 bg-teal-50 text-teal-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50/60'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={otherSymptom}
            onChange={(e) => setOtherSymptom(e.target.value)}
            placeholder="Other — describe your symptom"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder-slate-400 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
          />
          <div className="mt-4 flex items-center justify-between">
            {backBtn}
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={symptoms.length === 0 && !otherSymptom.trim()}
              className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* ── Step 3: Duration ──────────────────────────────── */}
      {step === 3 && (
        <>
          <p className="mb-4 text-sm font-semibold text-slate-700">How long has this been going on?</p>
          <div className="flex flex-col gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { setDuration(opt); setStep(4); }}
                className={`rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition ${
                  duration === opt
                    ? 'border-teal-400 bg-teal-50 text-teal-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50/60'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="mt-4">{backBtn}</div>
        </>
      )}

      {/* ── Step 4: Severity ──────────────────────────────── */}
      {step === 4 && (
        <>
          <p className="mb-4 text-sm font-semibold text-slate-700">How severe is it?</p>
          <div className="flex flex-col gap-2">
            {SEVERITY_OPTIONS.map(({ label, description, ring, idle }) => (
              <button
                key={label}
                type="button"
                onClick={() => { setSeverity(label); setStep(5); }}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  severity === label ? ring : `border-slate-200 bg-white ${idle}`
                }`}
              >
                <p className={`text-sm font-semibold ${severity === label ? '' : 'text-slate-700'}`}>{label}</p>
                <p className="text-xs text-slate-400">{description}</p>
              </button>
            ))}
          </div>
          <div className="mt-4">{backBtn}</div>
        </>
      )}

      {/* ── Step 5: Extra info + summary ─────────────────── */}
      {step === 5 && (
        <>
          <p className="mb-0.5 text-sm font-semibold text-slate-700">Anything else we should know?</p>
          <p className="mb-3 text-xs text-slate-400">Optional — medications, existing conditions, allergies</p>
          <textarea
            value={extraInfo}
            onChange={(e) => setExtraInfo(e.target.value)}
            placeholder="e.g. I'm currently taking blood pressure medication…"
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder-slate-400 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
          />

          {/* Summary */}
          <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/70 p-3 text-xs">
            <p className="mb-1.5 font-semibold text-teal-700">Summary</p>
            <div className="flex flex-col gap-1 text-slate-600">
              <span><span className="font-medium text-slate-700">Area:</span> {bodyArea}</span>
              <span><span className="font-medium text-slate-700">Symptoms:</span> {allSymptoms.join(', ') || '—'}</span>
              <span><span className="font-medium text-slate-700">Duration:</span> {duration}</span>
              <span><span className="font-medium text-slate-700">Severity:</span> {severity}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            {backBtn}
            <button
              type="button"
              onClick={handleGetGuidance}
              disabled={loading}
              className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? 'Getting guidance…' : 'Get Guidance'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
