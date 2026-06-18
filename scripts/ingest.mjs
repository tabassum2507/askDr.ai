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

async function embed(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini embedding error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.embedding.values;
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
      const embedding = await embed(chunk);
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
  await supabase.from('documents').delete().neq('id', 0);
  console.log('Cleared old data');
  for (const drug of DRUGS) {
    await ingestDrug(drug);
  }
  console.log('\nIngestion complete.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
