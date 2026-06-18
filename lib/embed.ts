const HF_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

export async function embed(text: string): Promise<number[]> {
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inputs: text,
      options: { wait_for_model: true }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HF Embedding API error ${response.status}: ${errorText}`);
  }

  const result = await response.json();

  // HF returns nested array for single input: [[0.1, 0.2, ...]]
  // We need to mean-pool if it returns token-level embeddings (2D array of arrays)
  if (Array.isArray(result) && Array.isArray(result[0]) && Array.isArray(result[0][0])) {
    // Token-level embeddings - mean pool them
    const tokens: number[][] = result[0];
    const dim = tokens[0].length;
    const pooled = new Array(dim).fill(0);
    for (const token of tokens) {
      for (let i = 0; i < dim; i++) pooled[i] += token[i];
    }
    for (let i = 0; i < dim; i++) pooled[i] /= tokens.length;
    // Normalize
    const norm = Math.sqrt(pooled.reduce((s, v) => s + v * v, 0));
    return pooled.map(v => v / norm);
  }

  // Already a flat array or single-level nested
  const embedding = Array.isArray(result[0]) ? result[0] : result;
  return embedding;
}
