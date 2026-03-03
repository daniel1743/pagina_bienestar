import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const INPUT_DIR = String(process.env.RESTORE_STORAGE_INPUT_DIR || '').trim();

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !INPUT_DIR) {
  console.error('Faltan variables SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o RESTORE_STORAGE_INPUT_DIR.');
  process.exit(1);
}

const toPosixPath = (value) => value.replace(/\\/g, '/');

const walkFiles = (dir) => {
  const output = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...walkFiles(fullPath));
      continue;
    }
    output.push(fullPath);
  }
  return output;
};

const uploadFile = async (bucket, bucketRelativePath, localFile) => {
  const encodedPath = bucketRelativePath
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  const url = `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`;
  const body = fs.readFileSync(localFile);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'x-upsert': 'true',
      'Content-Type': 'application/octet-stream',
    },
    body,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Upload failed [${response.status}] ${bucket}/${bucketRelativePath}: ${text.slice(0, 200)}`);
  }
};

const run = async () => {
  const bucketDirs = fs
    .readdirSync(INPUT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const summary = {
    started_at: new Date().toISOString(),
    input_dir: INPUT_DIR,
    buckets: {},
  };

  for (const bucket of bucketDirs) {
    const bucketRoot = path.join(INPUT_DIR, bucket);
    const files = walkFiles(bucketRoot);
    const bucketSummary = {
      files_total: files.length,
      files_uploaded: 0,
      errors: [],
    };
    summary.buckets[bucket] = bucketSummary;

    for (const localFile of files) {
      const relative = toPosixPath(path.relative(bucketRoot, localFile));
      try {
        await uploadFile(bucket, relative, localFile);
        bucketSummary.files_uploaded += 1;
      } catch (error) {
        bucketSummary.errors.push(String(error?.message || error));
      }
    }
  }

  summary.finished_at = new Date().toISOString();
  console.log(JSON.stringify(summary, null, 2));
};

run().catch((error) => {
  console.error(String(error?.stack || error));
  process.exit(1);
});
