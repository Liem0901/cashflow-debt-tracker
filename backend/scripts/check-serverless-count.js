/**
 * Hobby plan allows ≤12 serverless functions per deployment.
 * Every *.js file under api/ counts — keep only api/handler.js as the entry.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const apiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../api');
const HOBBY_LIMIT = 12;

function listApiJsFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listApiJsFiles(full, base));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(path.relative(base, full).replaceAll('\\', '/'));
    }
  }

  return files.sort();
}

const files = listApiJsFiles(apiDir);

if (files.length === 0) {
  console.error('No api/*.js entry found. Expected api/handler.js');
  process.exit(1);
}

if (files.length > HOBBY_LIMIT) {
  console.error(
    `Too many serverless entries under api/ (${files.length}). Hobby limit is ${HOBBY_LIMIT}.`
  );
  console.error('Keep only api/handler.js and put shared code in server/.');
  console.error('Found:\n' + files.map((f) => `  - api/${f}`).join('\n'));
  process.exit(1);
}

if (files.length > 1 || files[0] !== 'handler.js') {
  console.warn(
    `Warning: expected only api/handler.js, found ${files.length} file(s):\n` +
      files.map((f) => `  - api/${f}`).join('\n')
  );
}

console.log(`Serverless entries OK (${files.length}): api/${files.join(', api/')}`);
