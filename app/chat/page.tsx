'use client';

import { useState, useRef, useEffect, FormEvent, Suspense, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Leaf,
  Brain,
  FileText,
  Pill,
  Heart,
  Stethoscope,
  Apple,
  Ribbon,
  ImageIcon,
  X,
} from 'lucide-react';

const CATEGORIES = {
  'home-remedies': {
    title: 'Home Remedies',
    Icon: Leaf,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    welcome: 'I can suggest home remedies for common issues. What are you dealing with?',
  },
  'mental-health': {
    title: 'Mental Health',
    Icon: Brain,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    welcome: "I'm here to help with mental wellness information. What's on your mind?",
  },
  'report-assistance': {
    title: 'Report Assistance',
    Icon: FileText,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    welcome: "Describe your medical report or lab result and I'll help explain it.",
  },
  medicines: {
    title: 'Medicines',
    Icon: Pill,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    welcome:
      'Ask me about any medication — or snap a photo of the packaging to identify it.',
  },
  'female-health': {
    title: 'Female Health',
    Icon: Heart,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-50',
    welcome: "I can help with women's health questions. What would you like to know?",
  },
  'basic-health': {
    title: 'Basic Health',
    Icon: Stethoscope,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50',
    welcome: 'Ask me any general health question.',
  },
  diet: {
    title: 'Diet & Nutrition',
    Icon: Apple,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50',
    welcome: "I can help with nutrition and diet-related questions. What are you looking for?",
  },
  'cancer-health': {
    title: 'Cancer Health',
    Icon: Ribbon,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50',
    welcome:
      'I can provide information about cancer types, treatments, screening, and support resources. What would you like to know?',
  },
} as const;

type IntentKey = keyof typeof CATEGORIES;
const DEFAULT_INTENT: IntentKey = 'basic-health';

interface Citation {
  drug: string;
  section: string;
  source: string;
  similarity: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  emergency?: boolean;
  imagePreview?: string;       // data URL shown inside the user bubble
  extractedMedicine?: string;  // shown as a badge above the assistant answer
}

const MAX_IMAGE_MB = 5;

function ChatInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawIntent = searchParams.get('intent') ?? DEFAULT_INTENT;
  const intent = (rawIntent in CATEGORIES ? rawIntent : DEFAULT_INTENT) as IntentKey;
  const { title, Icon, iconColor, iconBg, welcome } = CATEGORIES[intent];

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: welcome },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<{
    name: string;
    preview: string; // base64 data URL
  } | null>(null);
  const [imageError, setImageError] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    setImageError('');
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // client-side size guard: base64 ≈ 4/3× binary
      const estimatedMB = (dataUrl.length * 3) / 4 / (1024 * 1024);
      if (estimatedMB > MAX_IMAGE_MB) {
        setImageError(`Image is too large (${estimatedMB.toFixed(1)} MB). Please use an image under ${MAX_IMAGE_MB} MB.`);
        return;
      }
      setPendingImage({ name: file.name, preview: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if ((!text && !pendingImage) || loading) return;

    const currentImage = pendingImage;
    setInput('');
    setPendingImage(null);
    setImageError('');
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: text,
        imagePreview: currentImage?.preview,
      },
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          intent,
          ...(currentImage ? { image: currentImage.preview } : {}),
        }),
      });

      let data: Record<string, unknown> = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned ${res.status} (non-JSON response)`);
      }

      if (!res.ok) {
        throw new Error((data.error as string) || `Request failed with status ${res.status}`);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: (data.answer as string) ?? '',
          citations: data.citations as Citation[] | undefined,
          emergency: data.emergency as boolean | undefined,
          extractedMedicine: data.extractedMedicine as string | undefined,
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${msg} Please try again.` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const canSend = (input.trim().length > 0 || pendingImage !== null) && !loading;

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="flex-none border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className={`rounded-lg p-1.5 ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-800">{title}</h1>
            <p className="text-xs text-slate-400">askDr.ai</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'user' ? (
                <div className="flex max-w-[80%] flex-col items-end gap-1.5">
                  {msg.imagePreview && (
                    <img
                      src={msg.imagePreview}
                      alt="Attached image"
                      className="max-h-48 max-w-[240px] rounded-2xl rounded-tr-sm object-contain shadow-sm"
                    />
                  )}
                  {msg.content && (
                    <div className="rounded-2xl rounded-tr-sm bg-slate-800 px-4 py-3 text-sm text-white shadow-sm">
                      {msg.content}
                    </div>
                  )}
                </div>
              ) : msg.emergency ? (
                <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-4">
                  <p className="mb-1 text-sm font-semibold text-red-700">Emergency</p>
                  <p className="text-sm leading-relaxed text-red-800">{msg.content}</p>
                </div>
              ) : (
                <div className="flex max-w-[80%] flex-col gap-2">
                  {/* Identified medicine badge */}
                  {msg.extractedMedicine && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                      <Pill className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                      Identified: {msg.extractedMedicine}
                    </div>
                  )}
                  <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="prose prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-800">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                  {msg.citations && msg.citations.length > 0 && (
                    <details className="text-xs text-slate-500">
                      <summary className="cursor-pointer select-none py-1 font-medium hover:text-slate-700">
                        Sources ({msg.citations.length})
                      </summary>
                      <div className="mt-2 flex flex-col gap-1.5 border-l-2 border-slate-200 pl-3">
                        {msg.citations.map((c, j) => (
                          <div key={j} className="flex items-start gap-1.5">
                            <span className="mt-0.5 shrink-0 text-slate-400">{j + 1}.</span>
                            <span>
                              <span className="font-medium capitalize text-slate-700">{c.drug}</span>
                              {' — '}
                              <span className="capitalize">{c.section.replace(/_/g, ' ')}</span>
                              <span className="ml-2 text-slate-400">
                                {Math.round(c.similarity * 100)}% match
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input area */}
      <div className="flex-none border-t border-slate-200 bg-white px-4 pb-4 pt-3 shadow-md">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">

          {/* Image preview strip */}
          {pendingImage && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <img
                src={pendingImage.preview}
                alt="Preview"
                className="h-10 w-10 rounded-lg object-cover"
              />
              <span className="flex-1 truncate text-xs text-slate-600">{pendingImage.name}</span>
              <button
                type="button"
                onClick={() => setPendingImage(null)}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Size error */}
          {imageError && (
            <p className="text-xs text-red-500">{imageError}</p>
          )}

          <form onSubmit={sendMessage} className="flex gap-2">
            {/* Hidden file input — images only */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            {/* Image button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              title="Attach a medicine photo"
              className="flex-none rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-500 transition hover:border-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              aria-label="Attach medicine image"
            >
              <ImageIcon className="h-4 w-4" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                pendingImage
                  ? 'Ask about this medicine… (or leave blank)'
                  : 'Ask a question…'
              }
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </form>

          <p className="text-center text-[11px] leading-snug text-slate-400">
            For informational purposes only. Not medical advice. Always consult a healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="text-sm text-slate-400">Loading…</div>
        </div>
      }
    >
      <ChatInterface />
    </Suspense>
  );
}
