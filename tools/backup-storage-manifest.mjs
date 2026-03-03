import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = String(process.env.BACKUP_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const SERVICE_ROLE_KEY = String(
  process.env.BACKUP_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
).trim();
const OUTPUT_PATH = String(
  process.env.BACKUP_STORAGE_MANIFEST_PATH || `ops/backups/storage-manifest-${Date.now()}.json`,
).trim();
const BUCKETS = String(process.env.BACKUP_STORAGE_BUCKETS || 'article-images,profiles')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Faltan BACKUP_SUPABASE_URL/SUPABASE_URL o BACKUP_SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

const listObjects = async (bucket, prefix = '', offset = 0, limit = 1000) => {
  const url = `${SUPABASE_URL}/storage/v1/object/list/${encodeURIComponent(bucket)}`;
  const body = {
    prefix,
    limit,
    offset,
    sortBy: { column: 'name', order: 'asc' },
  };
  const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Storage list failed [${response.status}] bucket=${bucket} prefix=${prefix}: ${text.slice(0, 400)}`);
  }
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : [];
};

const collectBucketManifest = async (bucket) => {
  const queue = [''];
  const visited = new Set();
  const files = [];
  while (queue.length) {
    const prefix = queue.shift();
    if (visited.has(prefix)) continue;
    visited.add(prefix);

    let offset = 0;
    while (true) {
      const entries = await listObjects(bucket, prefix, offset);
      if (!entries.length) break;
      for (const entry of entries) {
        const name = String(entry?.name || '').trim();
        if (!name) continue;
        const fullPath = prefix ? `${prefix.replace(/\/$/, '')}/${name}` : name;
        if (entry?.id) {
          files.push({
            bucket,
            name,
            fullPath,
            id: entry.id,
            updated_at: entry.updated_at || null,
            created_at: entry.created_at || null,
            last_accessed_at: entry.last_accessed_at || null,
            metadata: entry.metadata || null,
          });
          continue;
        }
        queue.push(fullPath);
      }
      if (entries.length < 1000) break;
      offset += entries.length;
    }
  }
  return files;
};

const run = async () => {
  const startedAt = new Date().toISOString();
  const output = {
    generated_at: startedAt,
    supabase_url: SUPABASE_URL,
    buckets: {},
  };

  for (const bucket of BUCKETS) {
    try {
      const files = await collectBucketManifest(bucket);
      output.buckets[bucket] = {
        ok: true,
        files_count: files.length,
        files,
      };
    } catch (error) {
      output.buckets[bucket] = {
        ok: false,
        error: String(error?.message || error),
        files_count: 0,
        files: [],
      };
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Storage manifest guardado: ${OUTPUT_PATH}`);
};

run().catch((error) => {
  console.error(String(error?.stack || error));
  process.exit(1);
});
