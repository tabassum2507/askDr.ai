import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: { transport: WebSocket },
    auth: { persistSession: false },
  }
);

const DRUGS = [
  'metformin',
  'ibuprofen',
  'amoxicillin',
  'atorvastatin',
  'acetaminophen',
  'omeprazole',
  'amlodipine',
  'losartan',
];

const SECTIONS = [
  'indications_and_usage',
  'dosage_and_administration',
  'warnings',
  'adverse_reactions',
  'drug_interactions',
  'contraindications',
  ['purpose', 'Purpose'],
  ['description', 'Description'],
  ['clinical_pharmacology', 'How it works'],
  ['information_for_patients', 'Patient information'],
];

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

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

async function fetchDrugLabel(drug) {
  const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${drug}"&limit=1`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`No results for ${drug}: ${res.status}`);
    return null;
  }
  const json = await res.json();
  return json.results?.[0] ?? null;
}

async function ingestDrug(drug) {
  // Skip if already ingested
  const { count } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('metadata->>drug', drug);

  if (count > 0) {
    console.log(`  Skipping ${drug} — already ingested (${count} chunks)`);
    return;
  }

  console.log(`\nProcessing: ${drug}`);
  const label = await fetchDrugLabel(drug);
  if (!label) return;

  const rows = [];

  for (const entry of SECTIONS) {
    const [field, sectionName] = Array.isArray(entry) ? entry : [entry, entry];
    const rawValue = label[field];
    if (!rawValue) continue;

    const text = Array.isArray(rawValue) ? rawValue.join(' ') : String(rawValue);
    const chunks = chunkText(text);

    for (const chunk of chunks) {
      const embedding = await embedWithRetry(chunk);
      rows.push({
        content: chunk,
        embedding,
        metadata: {
          drug,
          section: sectionName,
          source: 'openFDA drug label',
          category: 'medicines',
        },
      });
    }
  }

  if (rows.length === 0) {
    console.log(`  No usable sections found for ${drug}`);
    return;
  }

  const { error } = await supabase.from('documents').insert(rows);
  if (error) {
    console.error(`  Error inserting ${drug}: ${error.message}`);
  } else {
    console.log(`  Inserted ${rows.length} chunks for ${drug}`);
  }
}

async function main() {
  console.log('Starting ingestion...');
  for (const drug of DRUGS) {
    await ingestDrug(drug);
  }
  console.log('\nIngestion complete.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
