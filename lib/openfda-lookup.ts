export async function lookupDrug(query: string): Promise<{ name: string; context: string } | null> {
  try {
    const encoded = encodeURIComponent(query);
    const urls = [
      `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encoded}"&limit=1`,
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encoded}"&limit=1`,
      `https://api.fda.gov/drug/label.json?search="${encoded}"&limit=1`,
    ];

    for (const url of urls) {
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      const label = json.results?.[0];
      if (!label) continue;

      const name = label.openfda?.generic_name?.[0] || label.openfda?.brand_name?.[0] || query;
      const sections: [string, string][] = [
        ['indications_and_usage', 'Used for'],
        ['dosage_and_administration', 'Dosage'],
        ['warnings', 'Warnings'],
        ['adverse_reactions', 'Side effects'],
        ['drug_interactions', 'Interactions'],
        ['contraindications', 'Contraindications'],
        ['description', 'Description'],
        ['purpose', 'Purpose'],
      ];

      const context = sections
        .filter(([field]) => label[field])
        .map(([field, sectionLabel]) => {
          const text = Array.isArray(label[field]) ? label[field].join(' ') : String(label[field]);
          return `${sectionLabel}: ${text.slice(0, 800)}`;
        })
        .join('\n\n');

      if (context) return { name, context };
    }
    return null;
  } catch {
    return null;
  }
}
