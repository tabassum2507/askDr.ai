-- Enable pgvector extension
create extension if not exists vector;

-- Documents table
create table if not exists documents (
  id          bigserial primary key,
  content     text        not null,
  metadata    jsonb       not null default '{}',
  embedding   vector(768) not null,
  created_at  timestamptz not null default now()
);

-- HNSW index for fast cosine-similarity search
create index if not exists documents_embedding_hnsw_idx
  on documents
  using hnsw (embedding vector_cosine_ops);

-- Category-filtered match function
create or replace function match_documents_by_category (
  query_embedding  vector(768),
  filter_category  text    default null,
  match_count      int     default 5,
  match_threshold  float   default 0.3
)
returns table (
  id          bigint,
  content     text,
  metadata    jsonb,
  similarity  float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
    and (filter_category is null or documents.metadata->>'category' = filter_category)
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;

-- Match function used by retrieve.ts
create or replace function match_documents(
  query_embedding  vector(768),
  match_count      int     default 5,
  match_threshold  float   default 0.3
)
returns table (
  id          bigint,
  content     text,
  metadata    jsonb,
  similarity  float
)
language sql stable
as $$
  select
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from documents
  where 1 - (embedding <=> query_embedding) >= match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
