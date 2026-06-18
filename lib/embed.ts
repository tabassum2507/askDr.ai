const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY!,
  process.env.GEMINI_API_KEY_2!,
].filter(Boolean);

let currentKeyIndex = 0;

export async function embed(text: string): Promise<number[]> {
  for (let attempt = 0; attempt < GEMINI_KEYS.length; attempt++) {
    const key = GEMINI_KEYS[(currentKeyIndex + attempt) % GEMINI_KEYS.length];
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/gemini-embedding-001",
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
      currentKeyIndex = (currentKeyIndex + attempt) % GEMINI_KEYS.length; // stick with working key
      return data.embedding.values;
    } catch (err) {
      if (attempt === GEMINI_KEYS.length - 1) throw err;
    }
  }
  throw new Error("All Gemini API keys exhausted");
}
