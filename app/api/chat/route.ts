export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { retrieve } from '@/lib/retrieve';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Safety ────────────────────────────────────────────────────────────────────

const RED_FLAG_PATTERNS = [
  /chest\s*pain/i,
  /can'?t\s*breathe/i,
  /cannot\s*breathe/i,
  /difficulty\s*breath/i,
  /suicid/i,
  /kill\s*(my)?self/i,
  /want\s*to\s*die/i,
  /overdos/i,
  /unconscious/i,
  /not\s*breathing/i,
  /heart\s*attack/i,
  /stroke/i,
  /severe\s*bleed/i,
  /call\s*911/i,
];

const EMERGENCY_RESPONSE = {
  answer:
    'This sounds like a medical emergency. Please call 911 (or your local emergency number) immediately or go to the nearest emergency room. Do not wait.',
  citations: [],
  emergency: true,
};

function isEmergency(message: string): boolean {
  return RED_FLAG_PATTERNS.some((p) => p.test(message));
}

// ── Intent → category map ─────────────────────────────────────────────────────

const INTENT_CATEGORY: Record<string, string> = {
  'medicines':          'medicines',
  'home-remedies':      'home-remedies',
  'mental-health':      'mental-health',
  'report-assistance':  'report-assistance',
  'female-health':      'female-health',
  'basic-health':       'basic-health',
  'diet':               'diet',
  'cancer-health':      'cancer-health',
};

// ── Prompts ───────────────────────────────────────────────────────────────────

const FORMATTING = `
Formatting:
- Use **bold** for key terms.
- Use numbered lists or bullet points when listing multiple items.
- Keep paragraphs short — max 2-3 sentences each.
- Add a blank line between sections.`;

const GENERAL_SYSTEM_PROMPT = `You are a general health information assistant. You provide helpful, general wellness information.

Rules:
- Never diagnose conditions.
- Never prescribe medications or specific dosages.
- Always recommend consulting a healthcare professional.
- For mental health queries, always include a note about reaching out to a mental health professional or helpline.
- Be empathetic, clear, and concise.
- End every response with: "Please consult a healthcare professional for personalized advice."
${FORMATTING}`;

const RAG_SYSTEM_PROMPT = (contextBlock: string) =>
  `You are a health information assistant. Answer the user's question using ONLY the context provided below. Do not use outside knowledge.

Rules:
- Never diagnose a condition.
- Never recommend starting, stopping, or changing a medication.
- Always end your answer with: "Please confirm this with your doctor or pharmacist before taking any action."
- If the context does not contain enough information to answer, say: "I don't have enough information in my sources to answer that. Please consult your doctor."
${FORMATTING}

Context:
${contextBlock}`;

// ── Shared RAG helper ─────────────────────────────────────────────────────────

interface RagResult {
  answer: string;
  citations: { drug: string; section: string; source: string; similarity: number }[];
  source: string;
}

async function ragOrFallback(
  userMessage: string,
  category: string | undefined
): Promise<RagResult> {
  const docs = await retrieve(userMessage, 5, category);

  if (docs.length > 0) {
    const contextBlock = docs
      .map((d, i) => {
        const label = d.metadata.drug
          ? `Drug: ${d.metadata.drug} | Section: ${d.metadata.section}`
          : `Topic: ${d.metadata.topic ?? 'Health'} | Source: ${d.metadata.searchTerm ?? ''}`;
        return `[${i + 1}] ${label}\n${d.content}`;
      })
      .join('\n\n');

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      messages: [
        { role: 'system', content: RAG_SYSTEM_PROMPT(contextBlock) },
        { role: 'user', content: userMessage },
      ],
    });

    const answer = completion.choices[0]?.message?.content ?? '';
    const citations = docs.map((d) => ({
      drug: d.metadata.drug ?? d.metadata.topic ?? 'Health Topic',
      section: d.metadata.section ?? d.metadata.searchTerm ?? '',
      source: d.metadata.source,
      similarity: Math.round(d.similarity * 1000) / 1000,
    }));

    return { answer, citations, source: 'rag' };
  }

  // No results in index — fall back to general knowledge
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.4,
    messages: [
      { role: 'system', content: GENERAL_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
  });

  const answer = completion.choices[0]?.message?.content ?? '';
  return { answer, citations: [], source: 'general' };
}

// ── Vision → RAG pipeline ─────────────────────────────────────────────────────

async function handleImageQuery(
  imageBase64: string,
  userQuestion: string
): Promise<RagResult & { extractedMedicine?: string }> {
  let extractedMedicine = '';
  try {
    const visionRes = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageBase64 } },
            {
              type: 'text',
              text: 'Look at this medicine label or packaging image. Read all visible text carefully. Extract and return ONLY: the brand name, generic name, strength/dosage, and form (tablet/injection/etc). Be concise — one line only. Example: "Busulfan (ivBusulfex) 6 mg/mL injection".',
            },
          ],
        },
      ],
    });
    extractedMedicine = visionRes.choices[0]?.message?.content?.trim() ?? '';
  } catch (err) {
    console.error('Vision model error:', err);
    return {
      answer: "I couldn't read the medicine label clearly. Please try a clearer photo or type the medicine name directly.",
      citations: [],
      source: 'vision_error',
    };
  }

  if (!extractedMedicine) {
    return {
      answer: "I couldn't identify a medicine in this image. Please try a clearer photo or type the medicine name directly.",
      citations: [],
      source: 'vision_error',
    };
  }

  const question = userQuestion.trim() || 'What is this medicine and what is it used for?';
  const combinedQuery = `Regarding ${extractedMedicine}: ${question}`;

  const data = await ragOrFallback(combinedQuery, 'medicines');
  return { ...data, extractedMedicine };
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const message: string = reqBody?.message ?? '';
    const intent: string = reqBody?.intent ?? 'basic-health';
    const image: string | null = reqBody?.image ?? null;

    if (!message.trim() && !image) {
      return NextResponse.json({ error: 'message or image is required' }, { status: 400 });
    }

    if (isEmergency(message)) {
      return NextResponse.json(EMERGENCY_RESPONSE);
    }

    if (image) {
      const data = await handleImageQuery(image, message);
      return NextResponse.json(data);
    }

    const category = INTENT_CATEGORY[intent];
    const data = await ragOrFallback(message, category);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Chat API error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message, answer: `Sorry, something went wrong: ${message}`, citations: [] }, { status: 500 });
  }
}
