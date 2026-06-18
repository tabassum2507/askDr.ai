const HF_API_URL =
  'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2';

export async function embed(text: string): Promise<number[]> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.env.HUGGINGFACE_API_KEY) {
    headers['Authorization'] = `Bearer ${process.env.HUGGINGFACE_API_KEY}`;
  }

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ inputs: text }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HuggingFace embedding error ${response.status}: ${body}`);
  }

  const result = await response.json();
  // HF returns [float, ...] for single input or [[float, ...]] for batch
  return Array.isArray(result[0]) ? (result[0] as number[]) : (result as number[]);
}
