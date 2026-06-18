export interface DrugLookupResult {
  name: string;
  content: string;
  source: string;
}

const LABEL_FIELDS: [string, string][] = [
  ['indications_and_usage',    'Indications and Usage'],
  ['dosage_and_administration','Dosage and Administration'],
  ['warnings',                 'Warnings'],
  ['adverse_reactions',        'Adverse Reactions'],
  ['contraindications',        'Contraindications'],
  ['drug_interactions',        'Drug Interactions'],
  ['description',              'Description'],
  ['information_for_patients', 'Patient Information'],
];

function extractLabel(result: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [field, label] of LABEL_FIELDS) {
    const raw = result[field];
    if (!raw) continue;
    const text = Array.isArray(raw) ? (raw as string[]).join(' ') : String(raw);
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (cleaned.length > 20) parts.push(`**${label}:**\n${cleaned}`);
  }
  return parts.join('\n\n');
}

export async function lookupDrug(query: string): Promise<DrugLookupResult | null> {
  const term = query.slice(0, 200).trim();
  const enc = encodeURIComponent(term);

  const searches = [
    `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${enc}"&limit=1`,
    `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${enc}"&limit=1`,
    `https://api.fda.gov/drug/label.json?search=${enc}&limit=1`,
  ];

  for (const url of searches) {
    let res: Response;
    try {
      res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    } catch {
      continue;
    }
    if (!res.ok) continue;

    let json: { results?: Record<string, unknown>[] };
    try {
      json = await res.json();
    } catch {
      continue;
    }

    const result = json.results?.[0];
    if (!result) continue;

    const openfda = result.openfda as Record<string, string[]> | undefined;
    const name =
      openfda?.generic_name?.[0] ??
      openfda?.brand_name?.[0] ??
      term;

    const content = extractLabel(result);
    if (!content) continue;

    return { name, content, source: 'openFDA (live)' };
  }

  return null;
}
