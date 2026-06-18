import { createClient } from '@supabase/supabase-js';
import { embed } from './embed';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export interface DocumentMatch {
  id: string;
  content: string;
  metadata: {
    // medicines (openFDA)
    drug?: string;
    section?: string;
    // health topics (MedlinePlus)
    topic?: string;
    searchTerm?: string;
    // common
    source: string;
    category?: string;
  };
  similarity: number;
}

export async function retrieve(
  query: string,
  matchCount = 5,
  category?: string
): Promise<DocumentMatch[]> {
  const queryEmbedding = await embed(query);

  if (category) {
    const { data, error } = await supabase.rpc('match_documents_by_category', {
      query_embedding: queryEmbedding,
      filter_category: category,
      match_count: matchCount,
      match_threshold: 0.3,
    });
    // If the category function doesn't exist yet, fall back to unfiltered search
    if (error) {
      if (error.message.includes('Could not find the function')) {
        console.warn('match_documents_by_category not found — falling back to match_documents. Run schema.sql in Supabase to fix this.');
      } else {
        throw new Error(`Supabase RPC error: ${error.message}`);
      }
    } else {
      return (data ?? []) as DocumentMatch[];
    }
  }

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    match_threshold: 0.3,
  });

  if (error) throw new Error(`Supabase RPC error: ${error.message}`);
  return (data ?? []) as DocumentMatch[];
}
