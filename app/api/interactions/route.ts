export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { retrieve } from '@/lib/retrieve';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const RED_FLAG_PATTERNS = [
  /chest\s*pain/i,
  /can'?t\s*breathe/i,
  /cannot\s*breathe/i,
  /difficulty\s*breath/i,
  /suicid/i,
  /kill\s*(my)?self/i,
  /overdos/i,
  /unconscious/i,
  /not\s*breathing/i,
  /heart\s*attack/i,
  /stroke/i,
  /severe\s*bleed/i,
];

const SYSTEM_PROMPT = `You are a drug interaction checker. Based on the provided drug label information and reference data, identify any interactions between the given medicines.

For each interaction found:
1. Describe what the interaction is and the mechanism if known
2. Classify the overall severity as exactly one of: MAJOR, MODERATE, MINOR, or NONE
3. Explain what the patient should watch for and what to do

Format your response with the very first line as:
SEVERITY: [MAJOR|MODERATE|MINOR|NONE]

Then continue with your full explanation. If no interactions are found in the available data, say so clearly.

Rules:
- Never recommend starting, stopping, or changing a medication.
- Use **bold** for key terms.
- Use bullet points when listing multiple items.
- Always end with: "This is for informational purposes only. Always consult your doctor or pharmacist before combining medications."`;

async function fetchDrugInteractions(drugName: string): Promise<{ name: string; text: string } | null> {
  const encoded = encodeURIComponent(drugName.toLowerCase());
  const urls = [
    `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encoded}"&limit=1`,
    `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encoded}"&limit=1`,
    `https://api.fda.gov/drug/label.json?search="${encoded}"&limit=1`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      const label = json.results?.[0];
      if (!label) continue;

      const name = label.openfda?.generic_name?.[0] || label.openfda?.brand_name?.[0] || drugName;

      const sections: [string, string][] = [
        ['drug_interactions', 'Drug interactions'],
        ['warnings', 'Warnings'],
        ['contraindications', 'Contraindications'],
      ];

      const text = sections
        .filter(([field]) => label[field])
        .map(([field, label_]) => {
          const raw = Array.isArray(label[field]) ? label[field].join(' ') : String(label[field]);
          return `${label_}: ${raw.slice(0, 900)}`;
        })
        .join('\n\n');

      if (text) return { name, text };
    } catch {
      continue;
    }
  }
  return null;
}

function detectSeverity(text: string): 'major' | 'moderate' | 'minor' | 'none' | 'unknown' {
  const firstLine = text.split('\n')[0].toUpperCase();
  if (firstLine.includes('SEVERITY: MAJOR')) return 'major';
  if (firstLine.includes('SEVERITY: MODERATE')) return 'moderate';
  if (firstLine.includes('SEVERITY: MINOR')) return 'minor';
  if (firstLine.includes('SEVERITY: NONE')) return 'none';
  if (/no\s+known\s+interaction/i.test(text)) return 'none';
  return 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const medicines: string[] = Array.isArray(body.medicines)
      ? body.medicines.map((m: string) => String(m).trim()).filter(Boolean)
      : [];

    if (medicines.length < 2) {
      return NextResponse.json({ error: 'Please provide at least 2 medicines.' }, { status: 400 });
    }
    if (medicines.length > 4) {
      return NextResponse.json({ error: 'Maximum 4 medicines at a time.' }, { status: 400 });
    }

    // Safety check
    const combined = medicines.join(' ');
    if (RED_FLAG_PATTERNS.some((p) => p.test(combined))) {
      return NextResponse.json({
        answer: 'This sounds like a medical emergency. Please call 911 (or your local emergency number) immediately.',
        medicines,
        severity: 'unknown',
        citations: [],
      });
    }

    // Fetch openFDA data + RAG in parallel
    const [labelResults, ragDocs] = await Promise.all([
      Promise.all(medicines.map(fetchDrugInteractions)),
      retrieve(`drug interaction between ${medicines.join(' and ')}`, 4, 'medicines').catch(() => []),
    ]);

    const fdaContext = labelResults
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .map((r) => `=== ${r.name} (openFDA label) ===\n${r.text}`)
      .join('\n\n');

    const ragContext = ragDocs.length > 0
      ? `=== Knowledge Base ===\n${ragDocs.map((d) => d.content).join('\n\n')}`
      : '';

    const context = [fdaContext, ragContext].filter(Boolean).join('\n\n');

    const userMessage = context
      ? `Check interactions between: ${medicines.join(', ')}\n\nSource data:\n${context}`
      : `Check interactions between: ${medicines.join(', ')}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    });

    const rawAnswer = completion.choices[0]?.message?.content?.trim() ?? '';
    const severity = detectSeverity(rawAnswer);
    // Strip the SEVERITY: line so the UI can display it separately
    const answer = rawAnswer.replace(/^SEVERITY:\s*\w+\r?\n?/i, '').trim();

    const citations = ragDocs
      .filter((d) => d.similarity >= 0.3)
      .map((d) => ({
        drug: d.metadata.drug ?? d.metadata.topic ?? 'Health Topic',
        section: d.metadata.section ?? d.metadata.searchTerm ?? '',
        source: d.metadata.source,
        similarity: Math.round(d.similarity * 1000) / 1000,
      }));

    return NextResponse.json({ answer, medicines, severity, citations });
  } catch (err) {
    console.error('Interactions API error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
