import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readEnvLines(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf8').split('\n');
}

function mergeEnvFiles() {
  const merged = new Map();

  for (const fileName of ['.env.local', '.env.development.local']) {
    for (const line of readEnvLines(path.join(rootDir, fileName))) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separator = trimmed.indexOf('=');
      if (separator === -1) continue;
      merged.set(trimmed.slice(0, separator).trim(), line);
    }
  }

  return [...merged.values()].join('\n').trimEnd() + '\n';
}

const envPath = path.join(rootDir, '.env');
const content = mergeEnvFiles();

if (!content.trim()) {
  console.warn('No .env.local or .env.development.local found — skipping .env sync');
  process.exit(0);
}

fs.writeFileSync(envPath, content, 'utf8');
console.log('Synced .env from local env files for vercel dev');
