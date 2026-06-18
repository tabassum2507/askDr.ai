import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { XMLParser } from 'fast-xml-parser';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: { transport: WebSocket },
    auth: { persistSession: false },
  }
);

// ── Categories and search terms ───────────────────────────────────────────────

const CATEGORIES = [
  {
    category: 'home-remedies',
    terms: [
      'home remedies common cold',
      'natural fever treatment',
      'sore throat home care',
      'headache home treatment',
      'stomach ache home remedy',
      'cough natural remedy',
      'home treatment burns',
      'insect bite home care',
      'sunburn treatment home',
      'indigestion home remedy',
    ],
  },
  {
    category: 'mental-health',
    terms: [
      'anxiety disorders',
      'depression treatment',
      'stress management',
      'panic attacks',
      'insomnia sleep disorders',
      'meditation mindfulness health',
      'grief and loss',
      'anger management',
      'self care mental health',
      'therapy counseling',
    ],
  },
  {
    category: 'female-health',
    terms: [
      'menstrual cycle health',
      'pregnancy prenatal care',
      'menopause symptoms',
      'PCOS polycystic ovary',
      'breast health screening',
      'contraception birth control',
      'endometriosis',
      'urinary tract infection women',
      'iron deficiency anemia women',
      'osteoporosis women',
    ],
  },
  {
    category: 'basic-health',
    terms: [
      'blood pressure hypertension',
      'diabetes prevention',
      'heart health cardiovascular',
      'immune system health',
      'vaccination immunization',
      'first aid basics',
      'fever when to see doctor',
      'dehydration treatment',
      'allergies management',
      'infection prevention hygiene',
    ],
  },
  {
    category: 'diet',
    terms: [
      'balanced diet nutrition',
      'vitamins minerals supplements',
      'weight management healthy',
      'protein dietary needs',
      'fiber digestive health',
      'hydration water intake',
      'diabetes diet management',
      'heart healthy diet',
      'food allergies intolerance',
      'calcium bone health',
    ],
  },
  {
    category: 'report-assistance',
    terms: [
      'blood test results understanding',
      'cholesterol levels meaning',
      'blood sugar glucose levels',
      'hemoglobin blood count',
      'liver function test',
      'kidney function test',
      'thyroid test results',
      'urine test analysis',
      'complete blood count CBC',
      'HbA1c test diabetes',
    ],
  },
];

// ── Embedding ─────────────────────────────────────────────────────────────────

const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
].filter(Boolean);

let currentKeyIndex = 0;

async function embed(text) {
  for (let attempt = 0; attempt < GEMINI_KEYS.length; attempt++) {
    const key = GEMINI_KEYS[(currentKeyIndex + attempt) % GEMINI_KEYS.length];
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/gemini-embedding-001',
            content: { parts: [{ text }] },
            outputDimensionality: 768,
          }),
        }
      );

      if (response.status === 429) {
        console.log(`Key ${(currentKeyIndex + attempt) % GEMINI_KEYS.length + 1} rate limited, trying next...`);
        continue;
      }

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini embedding error ${response.status}: ${err}`);
      }

      const data = await response.json();
      currentKeyIndex = (currentKeyIndex + attempt) % GEMINI_KEYS.length;
      return data.embedding.values;
    } catch (err) {
      if (attempt === GEMINI_KEYS.length - 1) throw err;
    }
  }
  throw new Error('All Gemini API keys exhausted');
}

async function embedWithRetry(text, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await embed(text);
      await new Promise(r => setTimeout(r, 1500));
      return result;
    } catch (err) {
      if (err.message.includes('429') && attempt < maxRetries - 1) {
        const waitTime = (attempt + 1) * 35000;
        console.log(`  Rate limited, waiting ${waitTime / 1000}s...`);
        await new Promise(r => setTimeout(r, waitTime));
      } else {
        throw err;
      }
    }
  }
}

// ── Chunking ──────────────────────────────────────────────────────────────────

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

function chunkText(text) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

// ── MedlinePlus fetch + parse ─────────────────────────────────────────────────

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

async function fetchHealthTopics(searchTerm) {
  const url = `https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term=${encodeURIComponent(searchTerm)}&retmax=10`;

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    console.warn(`  Network error for "${searchTerm}": ${err.message}`);
    return [];
  }

  if (!res.ok) {
    console.warn(`  HTTP ${res.status} for "${searchTerm}"`);
    return [];
  }

  const xml = await res.text();
  let parsed;
  try {
    parsed = parser.parse(xml);
  } catch (err) {
    console.warn(`  XML parse error for "${searchTerm}": ${err.message}`);
    return [];
  }

  const documents = parsed?.nlmSearchResult?.list?.document;
  if (!documents) return [];

  const docs = Array.isArray(documents) ? documents : [documents];
  const results = [];

  for (const doc of docs) {
    const contents = doc?.content;
    if (!contents) continue;

    const contentArr = Array.isArray(contents) ? contents : [contents];

    let title = '';
    let summary = '';

    for (const c of contentArr) {
      const name = c['@_name'];
      const value = typeof c === 'string' ? c : (c['#text'] ?? c);
      const text = typeof value === 'string' ? value : String(value ?? '');

      if (name === 'title') title = text.trim();
      if (name === 'FullSummary') summary = stripHtml(text).trim();
    }

    if (summary.length > 50) {
      results.push({ title: title || searchTerm, summary });
    }
  }

  return results;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Starting health topics ingestion...\n');

  const totals = {};

  for (const { category, terms } of CATEGORIES) {
    // Skip category if it already has data
    const { count } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('metadata->>category', category);

    if (count > 0) {
      console.log(`\n=== ${category} — skipping (${count} chunks already exist) ===`);
      totals[category] = 0;
      continue;
    }

    console.log(`\n=== ${category} ===`);
    let categoryCount = 0;
    const seenContent = new Set();

    for (const term of terms) {
      const topics = await fetchHealthTopics(term);

      if (topics.length === 0) {
        console.log(`  [${category}] — "${term}" — 0 results`);
        await sleep(500);
        continue;
      }

      const rows = [];

      for (const { title, summary } of topics) {
        const chunks = chunkText(summary);
        for (const chunk of chunks) {
          if (seenContent.has(chunk)) continue;
          seenContent.add(chunk);

          const embedding = await embedWithRetry(chunk);
          rows.push({
            content: chunk,
            embedding,
            metadata: {
              category,
              topic: title,
              source: 'MedlinePlus',
              searchTerm: term,
            },
          });
        }
      }

      if (rows.length > 0) {
        const { error } = await supabase.from('documents').insert(rows);
        if (error) {
          console.error(`  Error inserting "${term}": ${error.message}`);
        } else {
          console.log(`  [${category}] — "${term}" — ${rows.length} chunks`);
          categoryCount += rows.length;
        }
      } else {
        console.log(`  [${category}] — "${term}" — 0 chunks (all duplicates)`);
      }

      await sleep(500);
    }

    totals[category] = categoryCount;
  }

  console.log('\n\n=== Ingestion complete ===');
  let grand = 0;
  for (const [cat, count] of Object.entries(totals)) {
    console.log(`  ${cat}: ${count} chunks`);
    grand += count;
  }
  console.log(`  TOTAL: ${grand} chunks`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
