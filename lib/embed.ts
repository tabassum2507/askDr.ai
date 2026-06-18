// Standard HF Inference API endpoint (more reliable than /pipeline/feature-extraction/)
const HF_API_URL =
  'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2';

export async function embed(text: string): Promise<number[]> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error(
      'HUGGINGFACE_API_KEY is not set. Get a free token at huggingface.co/settings/tokens and add it to .env.local'
    );
  }

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      inputs: text,
      options: { wait_for_model: true },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HF Embedding API error ${response.status}: ${body}`);
  }

  const result = await response.json();

  // /models/ endpoint returns [[float, ...]] for single string input
  // Handle token-level 3D shape just in case
  if (Array.isArray(result[0]) && Array.isArray(result[0][0])) {
    const tokens: number[][] = result[0];
    const dim = tokens[0].length;
    const pooled = new Array(dim).fill(0);
    for (const token of tokens) {
      for (let i = 0; i < dim; i++) pooled[i] += token[i];
    }
    for (let i = 0; i < dim; i++) pooled[i] /= tokens.length;
    const norm = Math.sqrt(pooled.reduce((s, v) => s + v * v, 0));
    return pooled.map(v => v / norm);
  }

  // [[float, ...]] → take first element
  return Array.isArray(result[0]) ? (result[0] as number[]) : (result as number[]);
}
