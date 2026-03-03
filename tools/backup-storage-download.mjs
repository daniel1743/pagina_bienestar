import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = String(
  process.env.BACKUP_SUPABASE_URL || process.env.SUPABASE_URL || '',
).trim();
const SERVICE_ROLE_KEY = String(
  process.env.BACKUP_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
).trim();
const OUTPUT_DIR = String(
  process.env.BACKUP_STORAGE_OUTPUT_DIR || `ops/backups/storage-download-${Date.now()}`,
).trim();
const BUCKETS = String(process.env.BACKUP_STORAGE_BUCKETS || 'article-images,profiles')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Faltan variables SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY para backup de Storage.');
  process.exit(1);
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

const safePathPart = (value) => value.replace(/[\\:*?"<>|]/g, '_');

const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
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
    throw new Error(`Storage list failed [${response.status}] bucket=${bucket} prefix=${prefix}: ${text.slice(0, 300)}`);
  }
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : [];
};

const collectBucketFiles = async (bucket) => {
  const files = [];
  const queue = [''];
  const visited = new Set();

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
          files.push(fullPath);
        } else {
          queue.push(fullPath);
        }
      }
      if (entries.length < 1000) break;
      offset += entries.length;
    }
  }

  return files;
};

const downloadObject = async (bucket, filePath, targetDir) => {
  const encodedPath = filePath
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  const url = `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`;
  const response = await fetch(url, { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Download failed [${response.status}] ${bucket}/${filePath}: ${text.slice(0, 200)}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const outputFile = path.join(targetDir, safePathPart(bucket), ...filePath.split('/').map(safePathPart));
  ensureDir(path.dirname(outputFile));
  fs.writeFileSync(outputFile, Buffer.from(arrayBuffer));
};

const run = async () => {
  ensureDir(OUTPUT_DIR);
  const summary = {
    generated_at: new Date().toISOString(),
    output_dir: OUTPUT_DIR,
    buckets: {},
  };

  for (const bucket of BUCKETS) {
    const bucketSummary = {
      ok: true,
      files_total: 0,
      files_downloaded: 0,
      errors: [],
    };
    summary.buckets[bucket] = bucketSummary;

    try {
      const files = await collectBucketFiles(bucket);
      bucketSummary.files_total = files.length;
      for (const filePath of files) {
        try {
          await downloadObject(bucket, filePath, OUTPUT_DIR);
          bucketSummary.files_downloaded += 1;
        } catch (error) {
          bucketSummary.errors.push(String(error?.message || error));
        }
      }
      if (bucketSummary.errors.length) bucketSummary.ok = false;
    } catch (error) {
      bucketSummary.ok = false;
      bucketSummary.errors.push(String(error?.message || error));
    }
  }

  const summaryPath = path.join(OUTPUT_DIR, 'storage-backup-summary.json');
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(`Storage snapshot descargado en: ${OUTPUT_DIR}`);
  console.log(`Resumen: ${summaryPath}`);
};

run().catch((error) => {
  console.error(String(error?.stack || error));
  process.exit(1);
});
