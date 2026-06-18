export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { retrieve } from '@/lib/retrieve';
import { lookupDrug } from '@/lib/openfda-lookup';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const enc = new TextEncoder();

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

const EMERGENCY_TEXT =
  'This sounds like a medical emergency. Please call 911 (or your local emergency number) immediately or go to the nearest emergency room. Do not wait.';

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

const RAG_SYSTEM_PROMPT = `You are a health information assistant. Answer the user's question using ONLY the context provided in the message. Do not use outside knowledge.

Rules:
- Never diagnose a condition.
- Never recommend starting, stopping, or changing a medication.
- Always end your answer with: "Please confirm this with your doctor or pharmacist before taking any action."
- If the context does not contain enough information to answer, say: "I don't have enough information in my sources to answer that. Please consult your doctor."
${FORMATTING}`;

const OPENFDA_SYSTEM_PROMPT = `You are a health information assistant. Answer the user's question using ONLY the official drug label information provided in the message.

Rules:
- NEVER recommend this medicine as a treatment for any condition. Your role is to inform, not prescribe.
- Never suggest someone start, stop, or change a medication.
- Always end your answer with: "Please consult your doctor before taking any medication."
- If the label does not contain enough information to answer, say so clearly.
${FORMATTING}`;

// ── Types ─────────────────────────────────────────────────────────────────────

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

type Citation = { drug: string; section: string; source: string; similarity: number };

interface GroqCallPrep {
  citations: Citation[];
  source: string;
  groqMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature: number;
  extractedMedicine?: string;
}

// ── Context preparation ───────────────────────────────────────────────────────

async function prepareContext(
  userMessage: string,
  category: string | undefined,
  history: HistoryMessage[]
): Promise<GroqCallPrep> {
  const docs = await retrieve(userMessage, 5, category);

  if (docs.length > 0 && docs[0].similarity >= 0.5) {
    const contextBlock = docs
      .map((d, i) => {
        const label = d.metadata.drug
          ? `Drug: ${d.metadata.drug} | Section: ${d.metadata.section}`
          : `Topic: ${d.metadata.topic ?? 'Health'} | Source: ${d.metadata.searchTerm ?? ''}`;
        return `[${i + 1}] ${label}\n${d.content}`;
      })
      .join('\n\n');

    return {
      citations: docs.map((d) => ({
        drug: d.metadata.drug ?? d.metadata.topic ?? 'Health Topic',
        section: d.metadata.section ?? d.metadata.searchTerm ?? '',
        source: d.metadata.source,
        similarity: Math.round(d.similarity * 1000) / 1000,
      })),
      source: 'rag',
      temperature: 0.2,
      groqMessages: [
        { role: 'system', content: RAG_SYSTEM_PROMPT },
        ...history.slice(-6),
        { role: 'user', content: `Context from sources:\n\n${contextBlock}\n\nQuestion: ${userMessage}` },
      ],
    };
  }

  if (category === 'medicines' && (docs.length === 0 || docs[0].similarity < 0.35)) {
    const fdaResult = await lookupDrug(userMessage).catch(() => null);
    if (fdaResult) {
      return {
        citations: [{ drug: fdaResult.name, section: 'Live lookup', source: 'openFDA (live)', similarity: 1 }],
        source: 'openfda_live',
        temperature: 0.2,
        groqMessages: [
          { role: 'system', content: OPENFDA_SYSTEM_PROMPT },
          ...history.slice(-6),
          { role: 'user', content: `Context from sources:\n\n${fdaResult.context}\n\nQuestion: ${userMessage}` },
        ],
      };
    }
  }

  return {
    citations: [],
    source: 'general',
    temperature: 0.4,
    groqMessages: [
      { role: 'system', content: GENERAL_SYSTEM_PROMPT },
      ...history.slice(-6),
      { role: 'user', content: userMessage },
    ],
  };
}

// ── Static streaming helper (no LLM) ─────────────────────────────────────────

function streamStaticText(
  text: string,
  citations: Citation[],
  source: string,
  opts: { emergency?: boolean; extractedMedicine?: string } = {}
): Response {
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(enc.encode(
          JSON.stringify({ type: 'citations', citations, source, extractedMedicine: opts.extractedMedicine }) + '\n'
        ));
        controller.enqueue(enc.encode(JSON.stringify({ type: 'text', text }) + '\n'));
        controller.enqueue(enc.encode(JSON.stringify({ type: 'done', emergency: opts.emergency ?? false }) + '\n'));
        controller.close();
      },
    }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const message: string = reqBody?.message ?? '';
    const intent: string = reqBody?.intent ?? 'basic-health';
    const image: string | null = reqBody?.image ?? null;
    const history: HistoryMessage[] = Array.isArray(reqBody?.history) ? reqBody.history : [];

    if (!message.trim() && !image) {
      return NextResponse.json({ error: 'message or image is required' }, { status: 400 });
    }

    if (isEmergency(message)) {
      return streamStaticText(EMERGENCY_TEXT, [], 'emergency', { emergency: true });
    }

    let prep: GroqCallPrep;

    if (image) {
      // Vision extraction is non-streaming — we need the result before we can query
      let extractedMedicine = '';
      try {
        const visionRes = await groq.chat.completions.create({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          temperature: 0.1,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: image } },
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
      }

      if (!extractedMedicine) {
        return streamStaticText(
          "I couldn't read the medicine label clearly. Please try a clearer photo or type the medicine name directly.",
          [],
          'vision_error'
        );
      }

      const question = message.trim() || 'What is this medicine and what is it used for?';
      prep = await prepareContext(`Regarding ${extractedMedicine}: ${question}`, 'medicines', history);
      prep = { ...prep, extractedMedicine };
    } else {
      prep = await prepareContext(message, INTENT_CATEGORY[intent], history);
    }

    const groqStream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: prep.temperature,
      stream: true,
      messages: prep.groqMessages,
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            controller.enqueue(enc.encode(
              JSON.stringify({
                type: 'citations',
                citations: prep.citations,
                source: prep.source,
                extractedMedicine: prep.extractedMedicine,
              }) + '\n'
            ));

            for await (const chunk of groqStream) {
              const text = chunk.choices[0]?.delta?.content ?? '';
              if (text) {
                controller.enqueue(enc.encode(JSON.stringify({ type: 'text', text }) + '\n'));
              }
            }

            controller.enqueue(enc.encode(JSON.stringify({ type: 'done' }) + '\n'));
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Streaming error';
            controller.enqueue(enc.encode(JSON.stringify({ type: 'error', message: errMsg }) + '\n'));
          } finally {
            controller.close();
          }
        },
      }),
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  } catch (err) {
    console.error('Chat API error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
